import React from 'react';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Card, Tabs, Badge, Calendar, Descriptions, Typography, Divider } from "antd";
import { SmileOutlined, CalendarOutlined } from '@ant-design/icons';
import { formatDate, countDays } from "../../publicHelpers";

import dayjs from 'dayjs';
import 'dayjs/locale/ru';

// Components
import AppCardTitle from "../../components/AppCardTitle";

// Styles
import './styles.css'

dayjs.locale('ru-ru');

const { Title } = Typography;

const PlantPage = () => {
    const [plantPage, setPlantPage] = useState([]);
    const [history, setHistory] = useState([]);

    const {id} = useParams();

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_BACKEND}/api/plants/${id}?populate[0]=categories&populate[1]=weeks.days`)
            .then(({ data }) => setPlantPage(data.data.attributes))
            .catch((error) => console.log(error));

        axios
            .get(`${process.env.REACT_APP_BACKEND}/api/histories?populate[0]=plant&filters[plant]=${id}`)
            .then(({ data }) => setHistory(data.data))
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
                                    actionString = 'Растение создано'
                                    break;
                                case 'update':
                                    actionString = 'Растение обновлено'
                                    break;
                                case 'other case value':
                                    actionString = '...'
                                    break;
                                default:
                                    actionString = 'Неизвестное действие'
                            }

                            return (
                                <li key={item.id}>
                                    <Badge status={item.attributes.action === 'update' ? 'warning' : 'success'} text={actionString} />
                                </li>
                            )
                        }

                        return false
                    })
                }
            </ul>
        );
    };

    const cellRender = (current, info) => {
        if (info.type === 'date') return dateCellRender(current);
        return false;
    };

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
                                <div className="card-plant-tabs__weeks">
                                    {plantPage.Content}
                                </div>
                                <Divider/>
                                <Title level={5}>Блоки недель: </Title>
                                <div className="card-plant-tabs__weeks">
                                    {plantPage.weeks ? (
                                        plantPage.weeks.map((data, index) => (
                                            <div className="week" data-id={data.id} key={data.id}>
                                                <div className="week__title">
                                                    {index + 1} Неделя:
                                                </div>
                                                <div className="week__days">
                                                    {
                                                        data.days.map((days_data, index) => (
                                                            <div className={days_data.passed ? 'day --passed' : 'day'} data-id={days_data.id} key={days_data.id}>
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

export default PlantPage;
