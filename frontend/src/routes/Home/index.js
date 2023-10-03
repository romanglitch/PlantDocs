import React, { useEffect, useState, useCallback } from "react";
import {Link} from "react-router-dom";
import axios from "axios";
import qs from "qs"
import { formatDate, countDays, getPostfix } from "../../publicHelpers";

import {
    Spin, Switch, Card, Radio
} from "antd";
import {
    AppstoreOutlined, ClockCircleOutlined
} from '@ant-design/icons';

// Styles
import './styles.css';

const Home = () => {
    const [isLoading, setIsLoading] = useState(true);

    const [plants, setPlants] = useState([]);
    const [categories, setCategories] = useState([]);

    const [filterCategory, setFilterCategory] = useState(false);
    const [filterArchive, setFilterArchive] = useState(false);

    const getPlants = useCallback(()=> {
        const query = {
            filters: {
                publishedAt: {
                    $null: filterArchive,
                }
            },
            populate: {
                0: 'category',
                1: 'weeks.days',
                2: 'photo'
            },
            publicationState: filterArchive ? 'preview' : 'live'
        }

        if (filterCategory) {
            query.filters.category = filterCategory
        }

        const queryParams = qs.stringify(query);

        setIsLoading(true)

        axios
            .get(`${process.env.REACT_APP_BACKEND}/api/plants?${queryParams}`)
            .then(({ data }) => {
                setPlants(data.data)
            })
            .catch((error) => {
                console.log(error)
            })
            .finally(() => {
                setIsLoading(false)
            });
    }, [filterCategory, filterArchive]);

    const onChangeCategory = (e) => setFilterCategory(e.target.value);
    const onChangeArchive = (checked) => setFilterArchive(checked)

    useEffect(() => {
        getPlants()

        axios
            .get(`${process.env.REACT_APP_BACKEND}/api/categories`)
            .then(({ data }) => {
                setCategories(data.data)
            })
            .catch((error) => {
                console.log(error)
            });
    }, [getPlants]);

    return (
        <div className="app-home">
            <Card className="app-card card-sidebar">
                <div className="card-sidebar__body">
                    <div className="card-sidebar__section">
                        <div className="card-sidebar__title">
                            Фильтр
                        </div>
                        <div className="card-sidebar__content">
                            <Radio.Group className="card-sidebar__list" onChange={onChangeCategory} value={filterCategory}>
                                <Radio value={false}>Все растения</Radio>
                                {categories.map(({ id, attributes }) => (
                                    <Radio value={id} key={id}>{attributes.Name}</Radio>
                                ))}
                            </Radio.Group>
                        </div>
                    </div>
                    <div className="card-sidebar__section">
                        <div className="card-sidebar__title">
                            Доп. параметры
                        </div>
                        <div className="card-sidebar__content">
                            <div className="card-sidebar__list">
                                <label className="app-plants-archive-switch">
                                    <Switch size="small" onChange={onChangeArchive} checked={filterArchive} />
                                    Показать архивные растения
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
            <Card className="app-card card-home" title="Растения">
                <div className="app-plants">
                    {isLoading ? (
                        <div className="app-plant-loader">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <>
                            {plants.length ? (
                                <div className="app-plants-grid">
                                    {plants.map(({ id, attributes }) => (
                                        <Link className="app-plant-item" key={id} to={'/plants/' + id}>
                                            <div className="app-plant-item__name">
                                                {attributes.Name}
                                            </div>
                                            <div className="app-plant-item__picture">
                                                {attributes.photo.data ? (
                                                    <img className="app-plant-item__image" alt="null" loading="lazy" src={`${process.env.REACT_APP_BACKEND}${attributes.photo.data.attributes.formats.small.url}`}/>
                                                ) : false}
                                                <div className="app-plant-item__days">
                                                    {countDays(attributes.weeks)}
                                                    <span>{getPostfix(countDays(attributes.weeks), 'день', 'дня', 'дней')}</span>
                                                </div>
                                            </div>
                                            <div className="app-plant-item__date">
                                                <ClockCircleOutlined />
                                                <span>{formatDate(attributes.updatedAt)}</span>
                                            </div>
                                            {attributes.category.data ? (
                                                <div className="app-plant-item__category">
                                                    <AppstoreOutlined />
                                                    <span>{attributes.category.data.attributes.Name}</span>
                                                </div>
                                            ) : false}
                                        </Link>
                                    ))}
                                </div>
                            ) : 'Растений не найдено' }
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
}

export default Home;