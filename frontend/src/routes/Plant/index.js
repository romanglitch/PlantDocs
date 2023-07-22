import React from 'react';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Card, Tabs, Badge, Calendar, Descriptions, Typography, Divider, Popover, Select, Popconfirm } from "antd";
import { SmileOutlined, CalendarOutlined } from '@ant-design/icons';
import { formatDate, countDays } from "../../publicHelpers";

import { AUTH_TOKEN } from "../../constant";

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
    const [history, setHistory] = useState([]);
    const {id} = useParams();

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_BACKEND}/api/plants/${id}?populate[0]=categories&populate[1]=weeks.days.tags`)
            .then(({ data }) => setPlantPage(data.data.attributes))
            .catch((error) => console.log(error));

        axios
            .get(`${process.env.REACT_APP_BACKEND}/api/histories?populate[0]=plant&filters[plant]=${id}`)
            .then(({ data }) => setHistory(data.data))
            .catch((error) => console.log(error));

        axios
            .get(`${process.env.REACT_APP_BACKEND}/api/tags`)
            .then(({ data }) => setTags(data.data))
            .catch((error) => console.log(error));
    }, [id]);

    const dateCellRender = (value) => {
        return (
            <ul className="events">
                {
                    history.map((item) => {
                        const hDate = dayjs(item.attributes.createdAt);
                        const cDate = value;

                        let cDateString = `${cDate.$D}/${cDate.$M}/${cDate.$y}`
                        let hDateString = `${hDate.$D}/${hDate.$M}/${hDate.$y}`

                        if (cDateString === hDateString) {
                            let actionString = null

                            switch (item.attributes.action) {
                                case 'create':
                                    actionString = {
                                        text: 'Растение создано',
                                        status: 'warning'
                                    }
                                    break;
                                case 'update':
                                    actionString = {
                                        text: 'Растение обновлено',
                                        status: 'warning'
                                    }
                                    break;
                                case 'other case value':
                                    actionString = {
                                        text: 'Название',
                                        status: 'success'
                                    }
                                    break;
                                default:
                                    actionString = 'Неизвестное действие'
                            }

                            return (
                                <li key={item.id}>
                                    <Badge status={actionString.status} text={actionString.text} />
                                </li>
                            )
                        } else {
                            return false
                        }
                    })
                }
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
                axios
                    .put(`${process.env.REACT_APP_BACKEND}/api/plants/${id}?populate[0]=categories&populate[1]=weeks.days.tags`, {
                        headers: {
                            'Authorization': `Bearer ${AUTH_TOKEN}`
                        },
                        data: {
                            weeks: weeks
                        }
                    })
                    .then((response) => {
                        setPlantPage(response.data.data.attributes)
                    })
                    .catch(function (error) {
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

            axios
                .put(`${process.env.REACT_APP_BACKEND}/api/plants/${id}?populate[0]=categories&populate[1]=weeks.days.tags`, {
                    headers: {
                        'Authorization': `Bearer ${AUTH_TOKEN}`
                    },
                    data: {
                        weeks: weeks
                    }
                })
                .then((response) => {
                    setPlantPage(response.data.data.attributes)
                })
                .catch(function (error) {
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
        )
    }

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
                                <div className="card-plant-tabs__content">
                                    {plantPage.Content}
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
                                                <div className="week__days">
                                                    {
                                                        data.days.map((days_data, index) => (
                                                            <Popover
                                                                trigger="click"
                                                                placement="top"
                                                                key={days_data.id}
                                                                content={
                                                                    (
                                                                        <div className={'popover-content'}>
                                                                            <DeleteDayButton weekId={data.id} dayId={days_data.id} />
                                                                            <SelectTags weekId={data.id} dayId={days_data.id} />
                                                                        </div>
                                                                    )
                                                                }
                                                            >
                                                                <div className={days_data.passed ? 'day --passed' : 'day'}>
                                                                    <div className="day__title">
                                                                        ({index + 1} день)
                                                                    </div>
                                                                    <div className="day__date">
                                                                        {
                                                                            formatDate(days_data.date)
                                                                        }
                                                                    </div>
                                                                    <div className="day__tags">
                                                                        {days_data.tags ? (
                                                                            days_data.tags.data.map((tags_data) => (
                                                                                <div className="tag" data-id={tags_data.id} key={tags_data.id}>
                                                                                    <div className="tag__name">
                                                                                        {tags_data.attributes.name}
                                                                                    </div>
                                                                                </div>
                                                                            ))
                                                                        ) : false}
                                                                    </div>
                                                                </div>
                                                            </Popover>
                                                        ))
                                                    }
                                                </div>
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
                                Календарь
                            </div>
                        ),
                        children: (
                            <div className="card-plant-tabs__content">
                                <Calendar cellRender={cellRender} />
                            </div>
                        ),
                    },
                ]}
            />
        </Card>
    );
}

export default Plant;
