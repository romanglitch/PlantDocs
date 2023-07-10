/**
 *
 * PlantPage
 */

import React from 'react';
import axios from "axios";
import { useEffect, useState } from "react";
import {Link, useParams} from "react-router-dom";

import './styles.css';

const PlantPage = () => {
    const [error, setError] = useState(null);
    const [plantsPage, setPlantsPage] = useState([]);
    const [isActive, setActive] = useState("false");

    const handleToggle = () => {
        setActive(!isActive);
    };

    let {id} = useParams();

    useEffect(() => {
        axios
            .get(`http://localhost:1337/api/plants/${id}?populate[0]=weeks.days.tags.icon&populate[1]=categories`)
            .then(({ data }) => setPlantsPage(data.data.attributes))
            .catch((error) => setError(error));
    }, [id]);

    if (error) {
        // Print errors if any
        return <div>An error occured: {error.message}</div>;
    }

    console.log(plantsPage)

    return (
        <div className="plant-page">
            <div className="plant-page__row plant-page__header">
                Название растения: {plantsPage.Name}
            </div>
            <div className="plant-page__row plant-page__cats">
                Категории:
                <div className="plant-page__cats__items">
                    {plantsPage.categories ? (
                        plantsPage.categories.data.map((cat_data) => (
                            <div className="cat" data-id={cat_data.id} key={cat_data.id}>
                                {cat_data.attributes.Name}
                            </div>
                        ))
                    ) : false }
                </div>
            </div>
            <div className="plant-page__row plant-page__content">
                Контент растения: {plantsPage.Content}
            </div>
            <button className="plant-page__btn" onClick={handleToggle}>
                {!isActive ? "Свернуть недели" : "Открыть недели"}
            </button>
            {!isActive ? (
                <div className="plant-page__row plant-page__weeks">
                    {plantsPage.weeks ? (
                        plantsPage.weeks.map((data, index) => (
                            <div className="week" data-id={data.id} key={data.id}>
                                <div className="week__title">
                                    Неделя: {index + 1}
                                </div>
                                <div className="week__days">
                                    {
                                        data.days.map((days_data, index) => (
                                            <div className="day" data-id={days_data.id} key={days_data.id}>
                                                <div className="day__title">
                                                    ({index + 1} день)
                                                </div>
                                                <div className="day__date">
                                                    {days_data.date}
                                                </div>
                                                <div className="day__tags">
                                                    {days_data.tags.data ? (
                                                        days_data.tags.data.map((tags_data) => (
                                                            <div className="tag" data-id={tags_data.id} key={tags_data.id}>
                                                                <div className="tag__name">
                                                                    {tags_data.attributes.name}
                                                                </div>
                                                                <div className="tag__icon">
                                                                    <img src={'http://localhost:1337' + tags_data.attributes.icon.data.attributes.url} alt={tags_data.attributes.name} />
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
            ) : false}
            <div className="plant-page__row plant-page__footer">
                <Link className="plant-page__link" to="/">Вернуться к растишкам</Link>
            </div>
        </div>
    );
};

export default PlantPage;
