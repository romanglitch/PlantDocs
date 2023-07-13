/**
 *
 * PlantPage
 */

import React from 'react';
import axios from "axios";
import { useEffect, useState } from "react";
import {Link, useParams} from "react-router-dom";

import auth from '../../utils/auth';

import './styles.css';

const PlantPage = () => {
    const [error, setError] = useState(null);
    const [plantsPage, setPlantsPage] = useState([]);

    const {id} = useParams();

    useEffect(() => {
        // update update the list of todos
        // when the component is rendered for the first time
        update();
    });

    // This function updates the component with the
    // current plant data stored in the server
    function update() {
        axios
            .get(`${process.env.REACT_APP_BACKEND}/api/plants/${id}?populate[0]=weeks.days.tags.icon&populate[1]=categories`)
            .then(({ data }) => setPlantsPage(data.data.attributes))
            .catch((error) => setError(error));
    }

    const reformatDate = (dateValue) => {
        let reformated = new Date(dateValue);
        let dd = String(reformated.getDate()).padStart(2, '0');
        let mm = String(reformated.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = reformated.getFullYear();

        reformated = dd + '/' + mm + '/' + yyyy;

        return reformated
    }

    const getDate = (addDays) => {
        let today = new Date();
        let getDate = addDays ? today.getDate() + addDays : today.getDate();
        let dd = String(getDate).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();

        today = yyyy + '-' + mm + '-' + dd;

        return today
    }

    if (error) {
        // Print errors if any
        return (
            <div className="App-main App-main_type_error">
                <div className="App-container">
                    An error occured: {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className="App-main App-main_type_plant">
            <div className="App-container">
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
                    <div className="plant-page__row plant-page__weeks">
                        {plantsPage.weeks ? (
                            plantsPage.weeks.map((data, index) => (
                                <div className="week" data-id={data.id} key={data.id}>
                                    <div className="week__title">
                                        {index + 1} Неделя:
                                        <button onClick={function (e) {
                                            e.preventDefault()

                                            // let newData = JSON.stringify({
                                            //     data: {
                                            //         weeks: [
                                            //             {
                                            //                 days: [
                                            //                     {
                                            //                         date: getDate()
                                            //                     },
                                            //                     {
                                            //                         date: getDate(1)
                                            //                     },
                                            //                     {
                                            //                         date: getDate(2)
                                            //                     },
                                            //                     {
                                            //                         date: getDate(3)
                                            //                     },
                                            //                     {
                                            //                         date: getDate(4)
                                            //                     },
                                            //                     {
                                            //                         date: getDate(5)
                                            //                     },
                                            //                     {
                                            //                         date: getDate(6)
                                            //                     }
                                            //                 ]
                                            //             }
                                            //         ],
                                            //     }
                                            // });
                                            //
                                            // let config = {
                                            //     method: 'put',
                                            //     url: `${process.env.REACT_APP_BACKEND}/api/plants/${id}`,
                                            //     headers: {
                                            //         'Authorization': 'Bearer ' + auth.getToken(),
                                            //         'Content-Type': 'application/json'
                                            //     },
                                            //     data : newData
                                            // };
                                            //
                                            // axios(config)
                                            //     .then(function (response) {
                                            //         update()
                                            //         console.log(JSON.stringify(response.data));
                                            //     })
                                            //     .catch(function (error) {
                                            //         console.log(error);
                                            //     });
                                        }}>Добавить 7 дней</button>
                                    </div>
                                    <div className="week__days">
                                        {
                                            data.days.map((days_data, index) => (
                                                <div className={days_data.passed ? 'day --passed' : 'day'} data-id={days_data.id} key={days_data.id}>
                                                    <div className="day__title">
                                                        ({index + 1} день)
                                                    </div>
                                                    <button className="edit" onClick={(e) => {
                                                        e.preventDefault()

                                                        let data = JSON.stringify({
                                                            "data": {
                                                                "Content": "<div>sa2345324234234dasd</div>"
                                                            }
                                                        });

                                                        let config = {
                                                            method: 'put',
                                                            url: `${process.env.REACT_APP_BACKEND}/api/plants/${id}`,
                                                            headers: {
                                                                'Authorization': 'Bearer ' + auth.getToken(),
                                                                'Content-Type': 'application/json'
                                                            },
                                                            data : data
                                                        };

                                                        axios(config)
                                                            .then(function (response) {
                                                                update()
                                                                console.log(JSON.stringify(response.data));
                                                            })
                                                            .catch(function (error) {
                                                                console.log(error);
                                                            });
                                                    }}>edit</button>
                                                    <div className="day__date">
                                                        {
                                                            reformatDate(days_data.date)
                                                        }
                                                    </div>
                                                    <div className="day__tags">
                                                        {days_data.tags.data ? (
                                                            days_data.tags.data.map((tags_data) => (
                                                                <div className="tag" data-id={tags_data.id} key={tags_data.id}>
                                                                    <div className="tag__name">
                                                                        {tags_data.attributes.name}
                                                                    </div>
                                                                    <div className="tag__icon">
                                                                        <img src={process.env.REACT_APP_BACKEND + tags_data.attributes.icon.data.attributes.url} alt={tags_data.attributes.name} />
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
                    <div className="plant-page__row plant-page__footer">
                        <Link className="plant-page__link" to="/">Вернуться к растишкам</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlantPage;
