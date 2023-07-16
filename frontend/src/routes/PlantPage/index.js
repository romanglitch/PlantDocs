import React from 'react';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Card, Tabs, Badge, Calendar } from "antd";
import { SmileOutlined, UndoOutlined } from '@ant-design/icons';

import dayjs from 'dayjs';
import 'dayjs/locale/ru';

// Components
import AppCardTitle from "../../components/AppCardTitle";

// Styles
import './styles.css'

dayjs.locale('ru-ru');

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
                            return (
                                <li key={item.id}>
                                    <Badge status={'error'} text={item.attributes.action} />
                                </li>
                            )
                        } else {
                            return false
                        }
                    })
                }
            </ul>
        );
    };

    const cellRender = (current, info) => {
        if (info.type === 'date') return dateCellRender(current);
        return info.originNode;
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
                                Контент растения
                            </div>
                        ),
                    },
                    {
                        key: '2',
                        label: (
                            <div className="card-plant-tabs__label">
                                <UndoOutlined />
                                История действий
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
