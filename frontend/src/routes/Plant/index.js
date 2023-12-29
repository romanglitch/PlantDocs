import React, {useEffect, useState} from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import qs from "qs"
import { getToken } from "../../helpers";
import {countDays, formatDate, getPostfix} from "../../publicHelpers";
import { Helmet } from 'react-helmet-async';

import {
    Spin,
    Card,
    Button,
    Tabs,
    Calendar,
    Select,
    Popconfirm,
    Input,
    Tooltip
} from "antd";
import {
    SmileOutlined,
    CalendarOutlined,
    PlusOutlined,
    BlockOutlined,
    MinusSquareOutlined, ClockCircleOutlined, AppstoreOutlined
} from '@ant-design/icons';

import DayCard from "../../components/DayCard";

import dayjs from 'dayjs';
import 'dayjs/locale/ru';

// Styles
import './styles.css'

dayjs.locale('ru-ru');

const { TextArea } = Input;

const Plant = () => {
    const navigate = useNavigate()
    const {id} = useParams()

    const [calFilter, setCalFilter] = useState([])

    const [isLoading, setIsLoading] = useState(true)
    const [plantPage, setPlantPage] = useState([])

    const [tags, setTags] = useState([])

    const plantPageQuery = qs.stringify({
        populate: {
            0: 'category',
            1: 'weeks.days.tags.icon',
            2: 'photo'
        }
    })

    const defaultPageURL = `${process.env.REACT_APP_BACKEND}/api/plants/${id}?${plantPageQuery}`

    useEffect(() => {
        axios
            .get(defaultPageURL)
            .then(({ data }) => {
                setPlantPage(data.data.attributes)
            })
            .catch((error) => {
                navigate('/404')
            });

        axios
            .get(`${process.env.REACT_APP_BACKEND}/api/tags?populate[0]=icon`)
            .then(({ data }) => {
                setTags(data.data)
            })
            .catch((error) => console.log(error))
            .finally(() => setIsLoading(false));
    }, [defaultPageURL, navigate])

    const CalendarFilter = () => {
        const selectOptions = [];
        let isChanged = false
        let currentSelected = calFilter

        let onChangeEvent = (values) => {
            currentSelected = values
            isChanged = true
        }

        let onMouseLeave = () => {
            if (isChanged) {
                setCalFilter(currentSelected)
                isChanged = false
            }
        }

        tags.forEach(function (tagItem) {
            selectOptions.push({
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

        return (
            <Select
                className="app-calendar-select"
                allowClear
                showSearch={false}
                mode="multiple"
                style={{
                    width: '320px',
                }}
                placeholder="Фильтр по тегам"
                defaultValue={calFilter}
                options={selectOptions}
                onChange={onChangeEvent}
                onMouseLeave={onMouseLeave}
            />
        )
    }

    const dateCellRender = (value) => {
        const {weeks} = plantPage

        return (
            <div className="app-calendar-item">
                {
                    weeks.map(function (weekItem) {
                        const dayId = weekItem.days.findIndex(x => x.date === value.toISOString().split('T')[0])
                        const dayItem = weekItem.days[dayId]

                        if (dayItem) {
                            let isDayFilter = dayItem.tags.data.filter(tag => calFilter.find(id => id === tag.id))

                            return (
                                <div className={`app-calendar-day ${dayItem.passed ? '--passed' : ''} ${isDayFilter.length ? '--filter-day' : ''}`} key={dayItem.id}>
                                    <div className="app-calendar-item__humidity">
                                        <div className="app-calendar-item__humidity__title">
                                            Влажность:
                                        </div>
                                        <div className="app-calendar-item__humidity__value">
                                            {dayItem.humidity ? `${dayItem.humidity}` : `0`}
                                            <small>%</small>
                                        </div>
                                    </div>
                                    {dayItem.tags.data.length ? (
                                        <div className={`app-calendar-item__tags ${calFilter.length ? '--filter-active' : '' }`}>
                                            {dayItem.tags.data.map((tagItem) => {
                                                return (
                                                    <Tooltip placement="top" title={tagItem.attributes.name} key={tagItem.id}>
                                                        <div className={`tag app-calendar-tag ${calFilter.find(x => x === tagItem.id) ? '--filtered' : '' }`}>
                                                            {tagItem.attributes.icon.data ? (
                                                                <img className="tag__icon" src={`${process.env.REACT_APP_BACKEND}${tagItem.attributes.icon.data.attributes.url}`} loading="lazy" alt={tagItem.attributes.name}/>
                                                            ) : false}
                                                        </div>
                                                    </Tooltip>
                                                )
                                            })}
                                        </div>
                                    ) : false }
                                </div>
                            )
                        }

                        return false
                    })
                }
            </div>
        )
    }

    const cellRender = (current, info) => {
        if (info.type === 'date') return dateCellRender(current);
        return false;
    }

    const DeleteWeekButton = () => {
        const [deleteWeekLoading, setDeleteWeekLoading] = useState(false);

        let onClickEvent = (e) => {
            e.preventDefault()
            setDeleteWeekLoading(true)

            const {weeks} = plantPage
            weeks.pop()

            axios({
                method: 'put',
                url: defaultPageURL,
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                data: {
                    data: {
                        weeks: weeks
                    }
                }
            }).then(function () {
                setPlantPage(plantPage => ({
                    ...plantPage,
                    ...weeks
                }))
            }).catch(function (error) {
                console.log(error);
            }).finally(function () {
                setDeleteWeekLoading(false)
            });
        }

        return (
            <Popconfirm
                title="Удалить неделю"
                description="Вы действительно хотите удалить неделю ?"
                onConfirm={onClickEvent}
                onCancel={e => e.preventDefault()}
                okText="Да"
                cancelText="Нет"
            >
                <Button type="primary" danger icon={<MinusSquareOutlined />} loading={deleteWeekLoading}>
                    Удалить неделю
                </Button>
            </Popconfirm>
        )
    }

    const WeekDescription = (data) => {
        const [isLoading, setIsLoading] = useState(false);
        const weekIndex = plantPage.weeks.findIndex(item => item.id === data.weekId);

        const {weeks} = plantPage

        let onBlurEvent = (e) => {
            if (weeks[weekIndex].description !== e.target.value) {
                setIsLoading(true)

                weeks[weekIndex].description = e.target.value

                setTimeout(function () {
                    axios({
                        method: 'put',
                        url: defaultPageURL,
                        headers: {
                            'Authorization': `Bearer ${getToken()}`
                        },
                        data: {
                            data: {
                                weeks: weeks
                            }
                        }
                    }).then(function (response) {
                        setPlantPage(response.data.data.attributes)
                        setIsLoading(false)
                    }).catch(function (error) {
                        console.log(error);
                    });
                }, 1000)

            }
        }

        return (
            <TextArea
                onBlur={onBlurEvent}
                defaultValue={weeks[weekIndex].description}
                bordered={false}
                placeholder="Описание недели"
                autoSize
                disabled={isLoading}
                style={{
                    padding: '4px 0',
                    color: '#000'
                }}
            />
        )
    }

    const AddWeekButton = () => {
        const [IsAddWeekLoading, setIsAddWeekLoading] = useState(false);

        const {weeks} = plantPage

        const onClickEvent = (e) => {
            e.preventDefault()
            setIsAddWeekLoading(true)

            let findWeeksByDays = weeks.filter(week => week.days.length !== 0),
                lastWeekByDays = findWeeksByDays[findWeeksByDays.length - 1],
                lastWeekDay = lastWeekByDays.days[lastWeekByDays.days.length - 1]

            const newDaysDate = (addDaysNumber) => {
                let lastDayDate = new Date(lastWeekDay.date)

                lastDayDate.setDate(lastDayDate.getDate() + addDaysNumber)

                // returned format date: 2023-07-28
                return lastDayDate.toISOString().split('T')[0]
            }

            weeks.push({
                days: [
                    {
                        date: newDaysDate(1)
                    },
                    {
                        date: newDaysDate(2)
                    },
                    {
                        date: newDaysDate(3)
                    },
                    {
                        date: newDaysDate(4)
                    },
                    {
                        date: newDaysDate(5)
                    },
                    {
                        date: newDaysDate(6)
                    },
                    {
                        date: newDaysDate(7)
                    }
                ]
            })

            axios({
                method: 'put',
                url: defaultPageURL,
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                data: {
                    data: {
                        weeks: weeks
                    }
                }
            }).then(function (response) {
                setPlantPage(response.data.data.attributes)
                setIsAddWeekLoading(false)
            }).catch(function (error) {
                console.log(error);
            });
        }

        return (
            <Button type="primary" loading={IsAddWeekLoading} icon={<BlockOutlined />} onClick={onClickEvent}>
                Добавить новую неделю
            </Button>
        )
    }

    const AddOneDayButton = (data) => {
        const [IsAddOneDayLoading, setIsAddOneDayLoading] = useState(false);

        const {weeks} = plantPage

        const onClickEvent = (e) => {
            setIsAddOneDayLoading(true)

            let findWeeksByDays = weeks.filter(week => week.days.length !== 0),
                lastWeekByDays = findWeeksByDays[findWeeksByDays.length - 1],
                lastWeekDay = lastWeekByDays.days[lastWeekByDays.days.length - 1]

            const newDaysDate = (addDaysNumber) => {
                let lastDayDate = new Date(lastWeekDay.date)

                lastDayDate.setDate(lastDayDate.getDate() + addDaysNumber)

                // returned format date: 2023-07-28
                return lastDayDate.toISOString().split('T')[0]
            }

            weeks[data.weekIndex].days.push({
                date: newDaysDate(1)
            })

            axios({
                method: 'put',
                url: defaultPageURL,
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                data: {
                    data: {
                        weeks: weeks
                    }
                }
            }).then(function (response) {
                setPlantPage(response.data.data.attributes)
                setIsAddOneDayLoading(false)
            }).catch(function (error) {
                console.log(error);
            });
        }

        return (
            <Button type="primary" loading={IsAddOneDayLoading} icon={<PlusOutlined />} onClick={onClickEvent}>
                1 день
            </Button>
        )
    }

    const AddSevenDaysButton = (data) => {
        const [IsAddSevenDayLoading, setIsAddSevenDayLoading] = useState(false);
        const {weeks} = plantPage

        const onClickEvent = (e) => {
            setIsAddSevenDayLoading(true)

            let findWeeksByDays = weeks.filter(week => week.days.length !== 0),
                lastWeekByDays = findWeeksByDays[findWeeksByDays.length - 1],
                lastWeekDay = lastWeekByDays.days[lastWeekByDays.days.length - 1]

            const newDaysDate = (addDaysNumber) => {
                let lastDayDate = new Date(lastWeekDay.date)

                lastDayDate.setDate(lastDayDate.getDate() + addDaysNumber)

                // returned format date: 2023-07-28
                return lastDayDate.toISOString().split('T')[0]
            }

            weeks[data.weekIndex].days.push(
                {
                    date: newDaysDate(1)
                },
                {
                    date: newDaysDate(2)
                },
                {
                    date: newDaysDate(3)
                },
                {
                    date: newDaysDate(4)
                },
                {
                    date: newDaysDate(5)
                },
                {
                    date: newDaysDate(6)
                },
                {
                    date: newDaysDate(7)
                })

            axios({
                method: 'put',
                url: defaultPageURL,
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                data: {
                    data: {
                        weeks: weeks
                    }
                }
            }).then(function (response) {
                setPlantPage(response.data.data.attributes)
                setIsAddSevenDayLoading(false)
            }).catch(function (error) {
                console.log(error);
            });
        }

        return (
            <Button type="primary" loading={IsAddSevenDayLoading} icon={<PlusOutlined />} onClick={onClickEvent}>
                7 дней
            </Button>
        )
    }

    const ArchiveButton = () => {
        const [archiveLoading, setArchiveLoading] = useState(false);

        let onClickEvent = (e) => {
            e.preventDefault()

            setArchiveLoading(true)

            axios({
                method: 'put',
                url: defaultPageURL,
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                data: {
                    data: {
                        publishedAt: plantPage.publishedAt ? null : Date.now()
                    }
                }
            }).then(function (response) {
                setTimeout(function () {
                    setPlantPage(response.data.data.attributes)
                    setArchiveLoading(false)
                }, 300)
            }).catch(function (error) {
                console.log(error);
            });
        }

        return (
            <Button type="primary" onClick={onClickEvent} loading={archiveLoading}>
                <span>{plantPage.publishedAt ? 'В архив' : 'Удалить из архива'}</span>
            </Button>
        )
    }

    const WeekIndex = (props) => {
        let index = props.weekIndex + 1
        let indexTitle = null

        switch (index) {
            case 1:
                indexTitle = `Малой`
                break;
            case 2:
                indexTitle = `Шлем`
                break;
            case 13:
                indexTitle = `Водопад`
                break;
            case 14:
                indexTitle = `Пустыня`
                break;
            case 15:
                indexTitle = `Лазарет`
                break;
            default:
                indexTitle = `${index - 2} неделя`
        }

        return indexTitle
    }

    const currentDate = () => {
        const date = new Date();

        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        return `${day}/${month}/${year}`
    }

    return (
        <>
            <Helmet>
                <title>{`${plantPage.Name ? plantPage.Name : 'Loading...'} - PlantDocs`}</title>
            </Helmet>
            <Card className="app-card card-plant">
                {isLoading ? (
                    <div className="app-plant-loader">
                        <Spin size="large" />
                    </div>
                ) : (
                    <>
                        {/*
                            plantPage.updatedAt ? - Баг, иначе ругается на дату (при ошибке 404)
                         */}
                        {plantPage.updatedAt ? (
                            <div className="app-plant-header">
                                {plantPage.photo ? (
                                    <img className="app-plant-header__bg" src={plantPage.photo.data ? `${process.env.REACT_APP_BACKEND}${plantPage.photo.data.attributes.formats.small.url}` : ''} alt="null"/>
                                ) : false}
                                <div className="app-plant-header__content">
                                    <div className="app-plant-header__days">
                                        {countDays(plantPage.weeks)}
                                        <span>{getPostfix(countDays(plantPage.weeks), 'день', 'дня', 'дней')}</span>
                                    </div>
                                    <div className="app-plant-header__info">
                                        <div className="app-plant-header__title">
                                            {plantPage.Name}
                                        </div>
                                        <div className="app-plant-header__date">
                                            <ClockCircleOutlined />
                                            <span>{formatDate(plantPage.updatedAt)}</span>
                                        </div>
                                        {plantPage.category.data ? (
                                            <div className="app-plant-header__category">
                                                <AppstoreOutlined />
                                                <span>{plantPage.category.data.attributes.Name}</span>
                                            </div>
                                        ) : false}
                                    </div>
                                    <div className="app-plant-header__actions">
                                        <ArchiveButton/>
                                    </div>
                                </div>
                            </div>
                        ) : 'Растение не найдено'}
                        <Tabs
                            className="card-plant-tabs"
                            defaultActiveKey="1"
                            items={[
                                {
                                    key: '1',
                                    label: (
                                        <div className="card-plant-tabs__label">
                                            <SmileOutlined />
                                            Растение ({`${countDays(plantPage.weeks)} ${getPostfix(countDays(plantPage.weeks), 'день', 'дня', 'дней')}`})
                                        </div>
                                    ),
                                    children: (
                                        <div className="card-plant-tabs__content">
                                            <div className="card-plant-tabs__weeks">
                                                {plantPage.weeks ? (
                                                    plantPage.weeks.map((data, index) => (
                                                        <div className="week" key={data.id}>
                                                            <div className="week__title">
                                                                <WeekIndex weekIndex={index} />
                                                            </div>
                                                            <div className="week__description">
                                                                <WeekDescription weekId={data.id} />
                                                            </div>
                                                            <div className="week__days">
                                                                {
                                                                    data.days.map((day_data, dayIndex) => (
                                                                        <DayCard
                                                                            key={day_data.id}
                                                                            tags={tags}
                                                                            dayData={day_data}
                                                                            dayIndex={dayIndex}
                                                                            weekId={data.id}
                                                                            weekIndex={index}
                                                                            weekData={data}
                                                                            plantPage={plantPage}
                                                                            isLast={(index + 1) === plantPage.weeks.length && (dayIndex + 1) === data.days.length}
                                                                            setPlantPageState={setPlantPage}
                                                                        />
                                                                    ))
                                                                }
                                                            </div>
                                                            {/* If this week is last */}
                                                            {(index + 1) === plantPage.weeks.length ? (
                                                                <div className="week__buttons">
                                                                    <AddOneDayButton weekIndex={index} />
                                                                    <AddSevenDaysButton weekIndex={index} />
                                                                    <DeleteWeekButton />
                                                                    {plantPage.weeks.length <= 14 ? (
                                                                        <>
                                                                            <AddWeekButton />
                                                                        </>
                                                                    ) : false }
                                                                </div>
                                                            ) : false }
                                                        </div>
                                                    ))
                                                ) : false}
                                            </div>
                                        </div>
                                    ),
                                },
                                {
                                    key: '2',
                                    label: (
                                        <div className="card-plant-tabs__label">
                                            <CalendarOutlined />
                                            Календарь ({currentDate()})
                                        </div>
                                    ),
                                    children: (
                                        <div className="card-plant-tabs__content">
                                            <CalendarFilter />
                                            <Calendar
                                                className={`card-plant-tabs__calendar ${calFilter.length ? '--filter-active' : ''}`}
                                                cellRender={cellRender}
                                            />
                                        </div>
                                    ),
                                }
                            ]}
                            onTabClick={function () {
                                window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
                            }}
                        />
                    </>
                )}
            </Card>
        </>
    );
}

export default Plant;