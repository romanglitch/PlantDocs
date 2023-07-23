import React from 'react';
import { useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown'
import { useParams } from "react-router-dom";
import axios from "axios";
import { getToken } from "../../helpers";
import { formatDate, countDays } from "../../publicHelpers";

import { Card, Tabs, Badge, Calendar, Descriptions, Typography, Divider, Popover, Select, Popconfirm, Input, InputNumber, message } from "antd";
import { SmileOutlined, CalendarOutlined } from '@ant-design/icons';

import dayjs from 'dayjs';
import 'dayjs/locale/ru';

// Components
import AppCardTitle from "../../components/AppCardTitle";

// Styles
import './styles.css'

dayjs.locale('ru-ru');

const { Title } = Typography;

const Plant = () => {
    const [plantPage, setPlantPage] = useState([]);
    const [tags, setTags] = useState([]);

    const [messageApi, contextHolder] = message.useMessage();

    const {id} = useParams();

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_BACKEND}/api/plants/${id}?populate[0]=categories&populate[1]=weeks.days.tags`)
            .then(({ data }) => setPlantPage(data.data.attributes))
            .catch((error) => console.log(error));

        axios
            .get(`${process.env.REACT_APP_BACKEND}/api/tags`)
            .then(({ data }) => setTags(data.data))
            .catch((error) => console.log(error));
    }, [id]);

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
                                    <li className="calendar-day-info" key={dayItem.id}>
                                        {dayItem.humidity ? (<Badge status={'success'} text={'Влажность: ' + dayItem.humidity + '%'} />) : false}
                                        {dayItem.description ? (<Badge status={'success'} text={dayItem.description} />) : false}
                                        {dayItem.tags.data.length ? dayItem.tags.data.map((tagItem) => {
                                            return (
                                                <Badge key={tagItem.id} status={'default'} text={tagItem.attributes.name} />
                                            )
                                        }) : false }
                                    </li>
                                )
                            }

                            return false
                        })
                    }
                </>
            </ul>
        )
    }

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
    }

    const SelectTags = (data) => {
        const weekObject = plantPage.weeks.find(item => item.id === data.weekId);
        const dayObject = weekObject.days.find(item => item.id === data.dayId);

        let onChangeEvent = (values) => {
            const {weeks} = plantPage
            dayObject.tags = values

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
                {contextHolder}
                <Select
                    mode="multiple"
                    allowClear
                    style={{
                        width: '320px',
                    }}
                    placeholder="Теги"
                    defaultValue={defaultOptions}
                    onChange={onChangeEvent}
                    options={selectOptions}
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
    }

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

                    messageApi.info('Влажность обновлена')
                }, 1000)
            }
        }

        return (
            <>
                {contextHolder}
                <InputNumber onBlur={onBlurEvent} addonAfter="%" min={0} max={100} defaultValue={weeks[weekIndex].days[dayIndex].humidity ? weeks[weekIndex].days[dayIndex].humidity : 0} />
            </>
        )
    }

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

                    messageApi.info('Описание обновлено')
                }, 1000)
            }
        }

        return (
            <>
                {contextHolder}
                <Input onBlur={onBlurEvent} defaultValue={weeks[weekIndex].days[dayIndex].description} placeholder="Описание дня" />
            </>
        )
    }

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

                    messageApi.info('Описание недели обновлено')
                }, 1000)
            }
        }

        return (
            <>
                {contextHolder}
                <Input onBlur={onBlurEvent} defaultValue={weeks[weekIndex].description} addonBefore="Описание недели" placeholder="Описание недели" />
            </>
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

    // !TODO: Вовод в календарь информацию о дне

    return (
        <Card className="app-card card-plant" title={AppCardTitle(plantPage.Name)}>
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
                                <Descriptions className="card-plant-tabs__descriptions" title="Информация">
                                    <Descriptions.Item label="Дней">
                                        {
                                            countDays(plantPage.weeks)
                                        }
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Категории">
                                        {plantPage.categories ? (
                                            plantPage.categories.data.map((cat_data) => (
                                                <div key={cat_data.id}>
                                                    {cat_data.attributes.Name}
                                                </div>
                                            ))
                                        ) : false }
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Последнее обновление">
                                        {formatDate(plantPage.updatedAt)}
                                    </Descriptions.Item>
                                </Descriptions>
                                <Title level={5}>Описание: </Title>
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
                                <Divider/>
                                <Title level={5}>Блоки недель: </Title>
                                <div className="card-plant-tabs__weeks">
                                    {plantPage.weeks ? (
                                        plantPage.weeks.map((data, index) => (
                                            <div className="week" key={data.id}>
                                                <div className="week__title">
                                                    {index + 1} Неделя:
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
                                                                            {/* If this week is last */}
                                                                            {(index + 1) === plantPage.weeks.length ? (
                                                                                <DeleteDayButton weekId={data.id} dayId={days_data.id} />
                                                                            ) : false }
                                                                            <SelectTags weekId={data.id} dayId={days_data.id} />
                                                                            <EditHumidity weekId={data.id} dayId={days_data.id} />
                                                                            <DayDescription weekId={data.id} dayId={days_data.id} />
                                                                        </div>
                                                                    ) : null
                                                                }
                                                            >
                                                                <div className={days_data.passed ? 'day --passed' : 'day'}>
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
                ]}
            />
        </Card>
    );
}

export default Plant;
