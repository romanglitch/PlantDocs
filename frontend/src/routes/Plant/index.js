import React from 'react';
import { useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown'
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "../../helpers";
import { formatDate, countDays } from "../../publicHelpers";

import {
    Spin,
    Card,
    Tabs,
    Badge,
    Calendar,
    Popover,
    Select,
    Popconfirm,
    Input,
    InputNumber,
    Tag
} from "antd";
import { SmileOutlined, CalendarOutlined, FileTextOutlined, LeftOutlined } from '@ant-design/icons';

import dayjs from 'dayjs';
import 'dayjs/locale/ru';

// Styles
import './styles.css'

dayjs.locale('ru-ru');

const { TextArea } = Input;

const Plant = () => {
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [plantPage, setPlantPage] = useState([]);
    const [tags, setTags] = useState([]);

    const {id} = useParams();

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_BACKEND}/api/plants/${id}?populate[0]=categories&populate[1]=weeks.days.tags`)
            .then(({ data }) => setPlantPage(data.data.attributes))
            .catch((error) => {
                // console.log(error)
                navigate('/')
            });

        axios
            .get(`${process.env.REACT_APP_BACKEND}/api/tags`)
            .then(({ data }) => setTags(data.data))
            .catch((error) => console.log(error))
            .finally(() => setIsLoading(false));
    }, [id, navigate]);

    const dateCellRender = (value) => {
        const {weeks} = plantPage

        return (
            <ul className="events">
                <>
                    {
                        weeks.map(function (weekItem) {
                            const dayId = weekItem.days.findIndex(x => x.date === value.toISOString().split('T')[0])
                            const dayItem = weekItem.days[dayId]

                            if (dayItem) {
                                return (
                                    <li className={dayItem.passed ? 'calendar-day-info --passed' : 'calendar-day-info'} key={dayItem.id}>
                                        {dayItem.humidity ? (<Badge status={'success'} text={'Влажность: ' + dayItem.humidity + '%'} />) : false}
                                        {dayItem.description ? (<Badge status={'success'} text={dayItem.description} />) : false}
                                        {dayItem.tags.data.length ? dayItem.tags.data.map((tagItem) => {
                                            return (
                                                <Badge key={tagItem.id} status={'default'} text={tagItem.attributes.name} />
                                            )
                                        }) : false }
                                        {dayItem.passed ? (<Badge status={'success'} text={'День закрыт'} />) : false}
                                    </li>
                                )
                            }

                            return false
                        })
                    }
                </>
            </ul>
        )
    };

    const cellRender = (current, info) => {
        if (info.type === 'date') return dateCellRender(current);
        return false;
    };

    const DeleteDayButton = (data) => {
        let onClickEvent = (e) => {
            e.preventDefault()

            const weekObject = plantPage.weeks.find(item => item.id === data.weekId);
            const weekIndex = plantPage.weeks.findIndex(item => item.id === data.weekId);
            const dayIndex = weekObject.days.findIndex(item => item.id === data.dayId);

            const {weeks} = plantPage
            delete weeks[weekIndex].days[dayIndex]

            // Remove empty values
            weeks[weekIndex].days = weeks[weekIndex].days.filter(n => n)

            const thisDayElement = document.querySelectorAll('.week')[weekIndex].getElementsByClassName('day')[dayIndex]

            thisDayElement.classList.add('--deleted')

            setTimeout(() => {
                axios({
                    method: 'put',
                    url: `${process.env.REACT_APP_BACKEND}/api/plants/${id}?populate[0]=categories&populate[1]=weeks.days.tags`,
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
                });
            }, 1000);
        }

        return (
            <Popconfirm
                title="Удалить день ?"
                onConfirm={onClickEvent}
                onCancel={e => e.preventDefault()}
                okText="Да"
                cancelText="Нет"
            >
                <button>Удалить день</button>
            </Popconfirm>
        )
    };

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
                        url: `${process.env.REACT_APP_BACKEND}/api/plants/${id}?populate[0]=categories&populate[1]=weeks.days.tags`,
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
                label: tagItem.attributes.name,
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
        let onClickEvent = (e) => {
            e.preventDefault()

            const weekObject = plantPage.weeks.find(item => item.id === data.weekId);
            const weekIndex = plantPage.weeks.findIndex(item => item.id === data.weekId);
            const dayIndex = weekObject.days.findIndex(item => item.id === data.dayId);

            const {weeks} = plantPage

            weeks[weekIndex].days[dayIndex].passed = true

            axios({
                method: 'put',
                url: `${process.env.REACT_APP_BACKEND}/api/plants/${id}?populate[0]=categories&populate[1]=weeks.days.tags`,
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
            });
        }

        return (
            <button onClick={onClickEvent}>Закрыть день</button>
        )
    };

    const EditHumidity = (data) => {
        const weekObject = plantPage.weeks.find(item => item.id === data.weekId);
        const weekIndex = plantPage.weeks.findIndex(item => item.id === data.weekId);
        const dayIndex = weekObject.days.findIndex(item => item.id === data.dayId);

        const {weeks} = plantPage

        let onBlurEvent = (e) => {
            if (weeks[weekIndex].days[dayIndex].humidity !== e.target.value) {
                weeks[weekIndex].days[dayIndex].humidity = e.target.value

                setTimeout(function () {
                    axios({
                        method: 'put',
                        url: `${process.env.REACT_APP_BACKEND}/api/plants/${id}?populate[0]=categories&populate[1]=weeks.days.tags`,
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
                    });
                }, 1000)
            }
        }

        return (
            <>
                <InputNumber onBlur={onBlurEvent} addonAfter="%" min={0} max={100} defaultValue={weeks[weekIndex].days[dayIndex].humidity ? weeks[weekIndex].days[dayIndex].humidity : 0} />
            </>
        )
    };

    const DayDescription = (data) => {
        const weekObject = plantPage.weeks.find(item => item.id === data.weekId);
        const weekIndex = plantPage.weeks.findIndex(item => item.id === data.weekId);
        const dayIndex = weekObject.days.findIndex(item => item.id === data.dayId);

        const {weeks} = plantPage

        let onBlurEvent = (e) => {
            if (weeks[weekIndex].days[dayIndex].description !== e.target.value) {
                weeks[weekIndex].days[dayIndex].description = e.target.value

                setTimeout(function () {
                    axios({
                        method: 'put',
                        url: `${process.env.REACT_APP_BACKEND}/api/plants/${id}?populate[0]=categories&populate[1]=weeks.days.tags`,
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
                    });
                }, 1000)
            }
        }

        return (
            <>
                <Input onBlur={onBlurEvent} defaultValue={weeks[weekIndex].days[dayIndex].description} placeholder="Описание дня" />
            </>
        )
    };

    const WeekDescription = (data) => {
        const weekIndex = plantPage.weeks.findIndex(item => item.id === data.weekId);

        const {weeks} = plantPage

        let onBlurEvent = (e) => {
            if (weeks[weekIndex].description !== e.target.value) {
                weeks[weekIndex].description = e.target.value

                setTimeout(function () {
                    axios({
                        method: 'put',
                        url: `${process.env.REACT_APP_BACKEND}/api/plants/${id}?populate[0]=categories&populate[1]=weeks.days.tags`,
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
                    });
                }, 1000)
            }
        }

        return (
            <TextArea onBlur={onBlurEvent} defaultValue={weeks[weekIndex].description} placeholder="Описание недели" autoSize />
        )
    };

    const AddWeekButton = () => {
        const {weeks} = plantPage

        const onClickEvent = (e) => {
            const newDaysDate = (addDaysNumber) => {
                const lastWeekDays = weeks[weeks.length - 1].days
                const lastDayDate = new Date(lastWeekDays[lastWeekDays.length - 1].date)

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
                url: `${process.env.REACT_APP_BACKEND}/api/plants/${id}?populate[0]=categories&populate[1]=weeks.days.tags`,
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
            });
        }

        return (
            <>
                <button className="test-btn" onClick={onClickEvent}>
                    Добавить новую неделю
                </button>
            </>
        )
    };

    const AddOneDayButton = (data) => {
        const {weeks} = plantPage

        const onClickEvent = (e) => {
            const newDaysDate = (addDaysNumber) => {
                const lastWeekDays = weeks[weeks.length - 1].days
                const lastDayDate = new Date(lastWeekDays[lastWeekDays.length - 1].date)

                lastDayDate.setDate(lastDayDate.getDate() + addDaysNumber)

                // returned format date: 2023-07-28
                return lastDayDate.toISOString().split('T')[0]
            }

            weeks[data.weekIndex].days.push({
                date: newDaysDate(1)
            })

            axios({
                method: 'put',
                url: `${process.env.REACT_APP_BACKEND}/api/plants/${id}?populate[0]=categories&populate[1]=weeks.days.tags`,
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
            });
        }

        return (
            <>
                <button className="test-btn" onClick={onClickEvent}>
                    Добавить 1 день
                </button>
            </>
        )
    };

    const AddSevenDaysButton = (data) => {
        const {weeks} = plantPage

        const onClickEvent = (e) => {
            const newDaysDate = (addDaysNumber) => {
                const lastWeekDays = weeks[weeks.length - 1].days
                const lastDayDate = new Date(lastWeekDays[lastWeekDays.length - 1].date)

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
                url: `${process.env.REACT_APP_BACKEND}/api/plants/${id}?populate[0]=categories&populate[1]=weeks.days.tags`,
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
            });
        }

        return (
            <>
                <button className="test-btn" onClick={onClickEvent}>
                    Добавить 7 дней
                </button>
            </>
        )
    };

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
            <h4>
                {dayIndex + 1} День
            </h4>
        )
    };

    const WeekIndex = (props) => {
        let index = props.weekIndex + 1
        let indexTitle = null

        switch (index) {
            case 1:
                indexTitle = `Каска`
                break;
            case 2:
                indexTitle = `Расток`
                break;
            default:
                indexTitle = `${index - 2} неделя`
        }

        return indexTitle
    }

    return (
        <>
            <Card className="app-card card-plant">
                {isLoading ? (
                    <div className="app-plant-loader">
                        <Spin size="large" />
                    </div>
                ) : (
                    <>
                        <div className="app-plant-item app-plant-item_card-plant">
                            <div className="app-plant-item__content">
                                <div className="app-plant-item__days">{countDays(plantPage.weeks)}<span>дней</span></div>
                                <div className="app-plant-item__name">
                                    <Link className="app-plant-item__home-link" to="/">
                                        <LeftOutlined />
                                        <span>{plantPage.Name}</span>
                                        <span>К растениям</span>
                                    </Link>
                                </div>
                                <div className="app-plant-item__date">
                                    Последнее обновление:
                                    <span>{formatDate(plantPage.updatedAt)}</span>
                                </div>
                                {plantPage.categories ? (
                                    <div className="app-plant-item__categories">
                                        <div className="app-plant-item__categories__title">Категории:</div>
                                        {plantPage.categories.data.length ? plantPage.categories.data.map((cat_data) => (
                                            <Tag bordered={false} key={cat_data.id}>
                                                {cat_data.attributes.Name}
                                            </Tag>
                                        )) : (
                                            <Tag bordered={false}>
                                                Без категории
                                            </Tag>
                                        )}
                                    </div>
                                ) : false}
                            </div>
                        </div>
                        <Tabs
                            className="card-plant-tabs"
                            defaultActiveKey="1"
                            items={[
                                {
                                    key: '1',
                                    label: (
                                        <div className="card-plant-tabs__label">
                                            <SmileOutlined />
                                            Растение
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
                                                                            content={!days_data.passed ?
                                                                                (
                                                                                    <div className={'popover-content'}>
                                                                                        <PassDayButton weekId={data.id} dayId={days_data.id} />
                                                                                        {/* If this week is last && If this day is last */}
                                                                                        {(index + 1) === plantPage.weeks.length && (dayIndex + 1) === data.days.length ? (
                                                                                            <DeleteDayButton weekId={data.id} dayId={days_data.id} />
                                                                                        ) : false }
                                                                                        <SelectTags weekId={data.id} dayId={days_data.id} />
                                                                                        <EditHumidity weekId={data.id} dayId={days_data.id} />
                                                                                        <DayDescription weekId={data.id} dayId={days_data.id} />
                                                                                    </div>
                                                                                ) : null
                                                                            }
                                                                        >
                                                                            <div className={`day${days_data.passed ? ' --passed' : ''}${(dayIndex + 1) === data.days.length ? ' --last' : ''}`}>
                                                                                <div className="day__title">
                                                                                    <DayIndex thisDayIndex={dayIndex} thisDayId={days_data.id} thisWeekIndex={index}/>
                                                                                </div>
                                                                                <div className="day__date">
                                                                                    {
                                                                                        formatDate(days_data.date)
                                                                                    }
                                                                                </div>
                                                                                <div className="day__humidity">
                                                                                    {days_data.humidity ? `Влажность: ${days_data.humidity}%` : `Влажность: 0%`}
                                                                                </div>
                                                                                <div className="day__tags">
                                                                                    Теги:
                                                                                    {days_data.tags ? (
                                                                                        days_data.tags.data.map((tags_data) => (
                                                                                            <div className="tag" key={tags_data.id}>
                                                                                                <div className="tag__name">
                                                                                                    {tags_data.attributes.name}
                                                                                                </div>
                                                                                            </div>
                                                                                        ))
                                                                                    ) : false}
                                                                                </div>
                                                                                <div className="day__description">
                                                                                    {days_data.description ? `Описание: ${days_data.description}` : `Описание: отсутствует`}
                                                                                </div>
                                                                            </div>
                                                                        </Popover>
                                                                    ))
                                                                }
                                                            </div>
                                                            {/* If this week is last */}
                                                            {(index + 1) === plantPage.weeks.length ? (
                                                                <>
                                                                    <AddOneDayButton weekIndex={index} />
                                                                    <AddSevenDaysButton weekIndex={index} />
                                                                </>
                                                            ) : false }
                                                        </div>
                                                    ))
                                                ) : false}
                                            </div>
                                            <AddWeekButton />
                                        </div>
                                    ),
                                },
                                {
                                    key: '2',
                                    label: (
                                        <div className="card-plant-tabs__label">
                                            <CalendarOutlined />
                                            Календарь
                                        </div>
                                    ),
                                    children: (
                                        <div className="card-plant-tabs__content">
                                            <Calendar className="card-plant-tabs__calendar" cellRender={cellRender} />
                                        </div>
                                    ),
                                },
                                plantPage.Content ? {
                                    key: '3',
                                    label: (
                                        <div className="card-plant-tabs__label">
                                            <FileTextOutlined />
                                            Описание
                                        </div>
                                    ),
                                    children: (
                                        <div className="card-plant-tabs__content">
                                            {plantPage.Content ? (
                                                <>
                                                    <div className="card-plant-tabs__plant-content">
                                                        <ReactMarkdown
                                                            transformImageUri={
                                                                function (src) {
                                                                    src = `${process.env.REACT_APP_BACKEND}${src}`
                                                                    return src
                                                                }
                                                            }
                                                            transformLinkUri={
                                                                function (href) {
                                                                    href = `${process.env.REACT_APP_BACKEND}${href}`
                                                                    return href
                                                                }
                                                            }
                                                        >
                                                            {plantPage.Content}
                                                        </ReactMarkdown>
                                                    </div>
                                                </>
                                            ) : false }
                                        </div>
                                    ),
                                } : false
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
