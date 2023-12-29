import React, {useState, useMemo, useCallback} from 'react';
import debounce from "lodash.debounce";
import {useParams} from "react-router-dom";
import axios from "axios";
import qs from "qs";

import {getToken} from "../../helpers";

import {InputNumber, Tooltip, Popover, Select, Popconfirm, Button, Spin} from "antd";

// Styles
import './styles.css';

import {formatDate} from "../../publicHelpers";

const DayCard = (props) => {
    // Weeks object
    const {weeks} = props.plantPage

    // Day index (REFACTORING!)
    const DayIndex = (data) => {
        let daysArray = []

        weeks.forEach(function (weekItem) {
            weekItem.days.forEach(function (dayItem) {
                daysArray.push(dayItem)
            })
        })

        const dayIndex = daysArray.findIndex(item => item.id === data.thisDayId);

        return (
            <div className="day__title__text">
                {dayIndex + 1} День
            </div>
        )
    }

    // Request loading...
    const [requestLoading, setRequestLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Request
    const {id} = useParams()
    const plantPageQuery = qs.stringify({
        populate: {
            0: 'category',
            1: 'weeks.days.tags.icon',
            2: 'photo'
        }
    })
    const defaultPageURL = `${process.env.REACT_APP_BACKEND}/api/plants/${id}?${plantPageQuery}`

    const putRequest = useCallback((weeksArray, updatePlantPage) => {
        setRequestLoading(true)

        axios({
            method: 'put',
            url: defaultPageURL,
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            data: {
                data: {
                    weeks: weeksArray
                }
            }
        }).then(function (response) {
            console.log(response)
        }).catch(function (error) {
            console.log(error);
        }).finally(function () {
            if (updatePlantPage) {
                props.setPlantPageState(plantPage => ({
                    ...plantPage,
                    ...weeks
                }))
            }
            setRequestLoading(false)
            setDeleteLoading(false)
        })
    }, [defaultPageURL, props, weeks])
    const DEBOUNCE_TIME_MS = 300;

    // Humidity
    const [humidity, setHumidity] = useState(props.dayData.humidity);
    const humidityInput = {
        changeEvent: useMemo(
            () =>
                debounce((value) => {
                    setHumidity(value)
                    weeks[props.weekIndex].days[props.dayIndex].humidity = value
                    putRequest(weeks)
                }, DEBOUNCE_TIME_MS),
            [props.dayIndex, props.weekIndex, putRequest, weeks]
        )
    }

    // Tags
    const [tags, setTags] = useState(props.dayData.tags.data);
    const tagsInput = {
        changeEvent: useMemo(
            () =>
                debounce((values) => {
                    const updatedTags = []

                    values.forEach(function (tagId) {
                        updatedTags.push(props.tags.find(tag => tag.id === tagId))
                    })

                    setTags(updatedTags)

                    weeks[props.weekIndex].days[props.dayIndex].tags = values
                    putRequest(weeks)
                }, DEBOUNCE_TIME_MS),
            [props.dayIndex, props.weekIndex, putRequest, weeks, props.tags]
        ),
        options: [],
        defaultValue: [],
    }

    // Tags -- Render all tags in input
    props.tags.forEach(function (tagItem) {
        tagsInput.options.push({
            label: (
                <div className="select-tags-option">
                    {tagItem.attributes.icon.data ? (
                        <img className="select-tags-option__icon" src={`${process.env.REACT_APP_BACKEND}${tagItem.attributes.icon.data.attributes.url}`} alt={tagItem.attributes.name}/>
                    ) : false}
                    {tagItem.attributes.name}
                </div>
            ),
            value: tagItem.id,
        });
    })

    // Tags -- Push default values to input
    tags.forEach(function (tagItem) {
        tagsInput.defaultValue.push(tagItem.id);
    })

    // Delete day button
    const deleteDayButton = {
        confirmEvent: () => {
            setDeleteLoading(true)

            delete weeks[props.weekIndex].days[props.dayIndex]

            // Remove empty values
            weeks[props.weekIndex].days = weeks[props.weekIndex].days.filter(n => n)

            putRequest(weeks, true)
        }
    }

    // Pass day
    const [passed, setPassed] = useState(props.dayData.passed);
    const passDayButton = {
        clickEvent: () => {
            passed ? weeks[props.weekIndex].days[props.dayIndex].passed = false : weeks[props.weekIndex].days[props.dayIndex].passed = true
            setPassed(weeks[props.weekIndex].days[props.dayIndex].passed)
            putRequest(weeks)
        }
    }

    return (
        <Popover
            trigger="click"
            placement="top"
            content={(
                <div className={`popover-content`}>
                    <Select
                        showSearch={false}
                        mode="multiple"
                        allowClear
                        style={{
                            width: '320px',
                        }}
                        placeholder="Теги"
                        defaultValue={tagsInput.defaultValue}
                        options={tagsInput.options}
                        onChange={tagsInput.changeEvent}
                    />
                    <InputNumber
                        onChange={humidityInput.changeEvent}
                        onFocus={function (e) {e.target.select()}}
                        min={0}
                        max={100}
                        defaultValue={!humidity ? 0 : humidity}
                        addonBefore={(
                            <div className={'app-humidity-input-placeholder'}>
                                <div>Влажность %</div>
                            </div>
                        )}
                    />
                    <div className="popover-content__grid">
                        {props.isLast ? (
                            <Popconfirm
                                title="Удалить день"
                                description="Вы действительно хотите удалить день ?"
                                onConfirm={deleteDayButton.confirmEvent}
                                onCancel={e => e.preventDefault()}
                                okText="Да"
                                cancelText="Нет"
                            >
                                <Button type="primary" danger>
                                    Удалить день
                                </Button>
                            </Popconfirm>
                        ) : false }
                        <Button type="primary" onClick={passDayButton.clickEvent}>
                            {passed ? 'Открыть день' : 'Закрыть день'}
                        </Button>
                    </div>
                </div>
            )}
        >
            <div className={`day ${passed ? ' --passed' : ''} ${requestLoading ? '--loading' : ''} ${deleteLoading ? '--deleted' : ''}`}>
                {requestLoading ? (
                    <Spin size={'large'}/>
                ) : false}
                <div className="day__title">
                    <DayIndex thisDayIndex={props.dayIndex} thisDayId={props.dayData.id} thisWeekIndex={props.weekIndex}/>
                    <div className="day__title__date">
                        {formatDate(props.dayData.date)}
                    </div>
                </div>
                <div className="day__humidity">
                    <div className="day__humidity__title">
                        Влажность:
                    </div>
                    <div className="day__humidity__value">
                        {humidity ? `${humidity}` : `0`}
                        <small>%</small>
                    </div>
                </div>
                {tags ? (
                    <div className="day__tags">
                        {tags.map((tags_data) => (
                            <Tooltip placement="bottom" title={tags_data.attributes.name} key={tags_data.id}>
                                <div className="tag">
                                    {tags_data.attributes.icon.data ? (
                                        <img className="tag__icon" src={`${process.env.REACT_APP_BACKEND}${tags_data.attributes.icon.data.attributes.url}`} alt={tags_data.attributes.name}/>
                                    ) : false}
                                </div>
                            </Tooltip>
                        ))}
                    </div>
                ) : false}
            </div>
        </Popover>
    );
}

export default DayCard;
