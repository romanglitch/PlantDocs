import React, {useState, useMemo} from 'react';
import debounce from "lodash.debounce";
import {useParams} from "react-router-dom";
import axios from "axios";
import qs from "qs";

import {getToken} from "../../helpers";

import {InputNumber, Tooltip, Popover} from "antd";

// Styles
import './styles.css';

import {formatDate} from "../../publicHelpers";

const DayCard = (props) => {
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
    const putRequest = (weeksArray) => {
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
            setRequestLoading(false)
        })
    }
    const DEBOUNCE_TIME_MS = 300;

    // Weeks object
    const {weeks} = props.plantPage

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
            []
        )
    }

    return (
        <Popover
            trigger="click"
            placement="top"
            content={(
                <div className={'popover-content'}>
                    <InputNumber
                        onChange={humidityInput.changeEvent}
                        onFocus={function (e) {e.target.select()}}
                        min={0}
                        max={100}
                        defaultValue={!humidity ? 0 : humidity}
                    />
                </div>
            )}
        >
            <div className={`day ${props.dayData.passed ? ' --passed' : ''} ${requestLoading ? '--loading' : ''}`}>
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
                {props.dayData.tags.data ? (
                    <div className="day__tags">
                        {props.dayData.tags.data.map((tags_data) => (
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
