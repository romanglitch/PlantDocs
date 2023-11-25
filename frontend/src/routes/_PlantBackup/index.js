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
    Popover,
    Select,
    Popconfirm,
    Input,
    InputNumber,
    Tooltip,
    notification
} from "antd";
import {
    SmileOutlined,
    CalendarOutlined,
    PlusOutlined,
    BlockOutlined,
    MinusSquareOutlined, ClockCircleOutlined, AppstoreOutlined
} from '@ant-design/icons';

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

    const [api, contextHolder] = notification.useNotification()

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

    // for test commit

    const openChangesNotification = () => {
        api.open({
            message: 'Есть несохраненные изменения!',
            duration: null,
            // placement: 'bottom',
            closeIcon: false,
            className: 'app-changes-notify',
            key: 'changes',
        });
    }

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

    const DeleteDayButton = (data) => {
        const [IsDeleteLoading, setIsDeleteLoading] = useState(false);

        let onClickEvent = (e) => {
            e.preventDefault()

            setIsDeleteLoading(true)

            const weekObject = plantPage.weeks.find(item => item.id === data.weekId);
            const weekIndex = plantPage.weeks.findIndex(item => item.id === data.weekId);
            const dayIndex = weekObject.days.findIndex(item => item.id === data.dayId);

            const {weeks} = plantPage
            delete weeks[weekIndex].days[dayIndex]

            // Remove empty values
            weeks[weekIndex].days = weeks[weekIndex].days.filter(n => n)

            const thisDayElement = document.querySelectorAll('.week')[weekIndex].getElementsByClassName('day')[dayIndex]

            thisDayElement.classList.add('--deleted')

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
                setIsDeleteLoading(false)
                setPlantPage(response.data.data.attributes)
            }).catch(function (error) {
                console.log(error);
            });
        }

        return (
            <Popconfirm
                title="Удалить день"
                description="Вы действительно хотите удалить день ?"
                onConfirm={onClickEvent}
                onCancel={e => e.preventDefault()}
                okText="Да"
                cancelText="Нет"
            >
                <Button type="primary" danger loading={IsDeleteLoading}>
                    Удалить день
                </Button>
            </Popconfirm>
        )
    }

    const DeleteWeekButton = () => {
        let onClickEvent = (e) => {
            e.preventDefault()

            const {weeks} = plantPage
            weeks.pop()

            setPlantPage(plantPage => ({
                ...plantPage,
                ...weeks
            }));

            openChangesNotification()
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
                <Button type="primary" danger icon={<MinusSquareOutlined />}>
                    Удалить неделю
                </Button>
            </Popconfirm>
        )
    }

    const SelectTags = (data) => {
        const weekObject = plantPage.weeks.find(item => item.id === data.weekId);
        const dayObject = weekObject.days.find(item => item.id === data.dayId);

        const {weeks} = plantPage

        let isChanged = false

        let onChangeEvent = (values) => {
            dayObject.tags = values
            isChanged = true
        }

        let onMouseLeave = () => {
            if (isChanged) {
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
                        isChanged = false
                    }).catch(function (error) {
                        console.log(error);
                    });
                }, 300)
            }
        }

        const selectOptions = [];

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

        const defaultOptions = []

        dayObject.tags.data.forEach(function (tagItem) {
            defaultOptions.push(tagItem.id);
        })

        return (
            <>
                <Select
                    showSearch={false}
                    mode="multiple"
                    allowClear
                    style={{
                        width: '320px',
                    }}
                    placeholder="Теги"
                    defaultValue={defaultOptions}
                    options={selectOptions}
                    onChange={onChangeEvent}
                    onMouseLeave={onMouseLeave}
                />
            </>
        )

    }

    const PassDayButton = (data) => {
        const [IsPassLoading, setIsPassLoading] = useState(false);
        const weekObject = plantPage.weeks.find(item => item.id === data.weekId);
        const weekIndex = plantPage.weeks.findIndex(item => item.id === data.weekId);
        const dayIndex = weekObject.days.findIndex(item => item.id === data.dayId);

        const {weeks} = plantPage

        let isPassed = weeks[weekIndex].days[dayIndex].passed;

        let onClickEvent = (e) => {
            e.preventDefault()

            setIsPassLoading(true)

            isPassed ? weeks[weekIndex].days[dayIndex].passed = false : weeks[weekIndex].days[dayIndex].passed = true

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
            }).catch(function (error) {
                console.log(error);
            }).finally(function () {
                setIsPassLoading(false)
            });
        }

        return (
            <Button type="primary" onClick={onClickEvent} loading={IsPassLoading}>
                {isPassed ? 'Открыть день' : 'Закрыть день'}
            </Button>
        )
    }

    const EditHumidity = (data) => {
        const [IsHumLoading, setIsHumLoading] = useState(false);

        const weekObject = plantPage.weeks.find(item => item.id === data.weekId);
        const weekIndex = plantPage.weeks.findIndex(item => item.id === data.weekId);
        const dayIndex = weekObject.days.findIndex(item => item.id === data.dayId);

        const {weeks} = plantPage

        let onBlurEvent = (e) => {
            setIsHumLoading(true)

            if (weeks[weekIndex].days[dayIndex].humidity !== e.target.value) {
                weeks[weekIndex].days[dayIndex].humidity = e.target.value

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
                }).catch(function (error) {
                    console.log(error);
                }).finally(function () {
                    setIsHumLoading(false)
                });
            }
        }

        return (
            <>
                <InputNumber onBlur={onBlurEvent} addonBefore={(
                    <div className={'app-humidity-input-placeholder'}>
                        <div>Влажность %</div>
                        {IsHumLoading ? (<Spin size={"small"}/>) : false}
                    </div>
                )} min={0} max={100} defaultValue={weeks[weekIndex].days[dayIndex].humidity ? weeks[weekIndex].days[dayIndex].humidity : 0} />
            </>
        )
    };

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
            api.destroy('changes')

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
                api.open({
                    message: 'Изменения сохранены (+1 неделя)',
                    className: 'app-changes-notify',
                    duration: 3,
                    closeIcon: false,
                    key: 'saved'
                });
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
            api.destroy('changes')

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
                api.open({
                    message: 'Изменения сохранены (+7 дней)',
                    className: 'app-changes-notify',
                    duration: 3,
                    closeIcon: false,
                    key: 'saved'
                });
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

            api.destroy('changes')

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
                setPlantPage(response.data.data.attributes)
                setArchiveLoading(false)
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

    const DayIndex = (data) => {
        const {weeks} = plantPage

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
            {contextHolder}
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
                                                                    data.days.map((days_data, dayIndex) => (
                                                                        <Popover
                                                                            trigger="click"
                                                                            placement="top"
                                                                            key={days_data.id}
                                                                            content={(
                                                                                <div className={'popover-content'}>
                                                                                    <SelectTags weekId={data.id} dayId={days_data.id} />
                                                                                    <EditHumidity weekId={data.id} dayId={days_data.id} />
                                                                                    <div className="popover-content__grid">
                                                                                        {/* If this week is last && If this day is last */}
                                                                                        {(index + 1) === plantPage.weeks.length && (dayIndex + 1) === data.days.length ? (
                                                                                            <DeleteDayButton weekId={data.id} dayId={days_data.id} />
                                                                                        ) : false }
                                                                                        <PassDayButton weekId={data.id} dayId={days_data.id} />
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        >
                                                                            <div className={`day${days_data.passed ? ' --passed' : ''}${(dayIndex + 1) === data.days.length ? ' --last' : ''}`}>
                                                                                <div className="day__title">
                                                                                    <DayIndex thisDayIndex={dayIndex} thisDayId={days_data.id} thisWeekIndex={index}/>
                                                                                    <div className="day__title__date">
                                                                                        {formatDate(days_data.date)}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="day__humidity">
                                                                                    <div className="day__humidity__title">
                                                                                        Влажность:
                                                                                    </div>
                                                                                    <div className="day__humidity__value">
                                                                                        {days_data.humidity ? `${days_data.humidity}` : `0`}
                                                                                        <small>%</small>
                                                                                    </div>
                                                                                </div>
                                                                                {days_data.tags.data ? (
                                                                                    <div className="day__tags">
                                                                                        {days_data.tags.data.map((tags_data) => (
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
                                                                    ))
                                                                }
                                                            </div>
                                                            {/* If this week is last */}
                                                            {(index + 1) === plantPage.weeks.length ? (
                                                                <div className="week__buttons">
                                                                    <AddOneDayButton weekIndex={index} />
                                                                    <AddSevenDaysButton weekIndex={index} />
                                                                    {plantPage.weeks.length <= 14 ? (
                                                                        <>
                                                                            <DeleteWeekButton />
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
