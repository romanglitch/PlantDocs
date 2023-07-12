/**
 *
 * EditPlantPage
 */

import React, {useEffect, useState} from 'react';
import {Link, useNavigate, useParams} from "react-router-dom";
import axios from "axios";

import auth from '../../utils/auth';

import './styles.css';

const EditPlantPage = () => {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();
    const {id} = useParams()

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_BACKEND}/api/categories`)
            .then(({ data }) => setCategories(data.data))
            .catch((error) => console.log(error));
    }, []);

    const onSubmit = (e) => {
        e.preventDefault()

        let eventType = e.type

        let inputValues = {
            name: document.querySelector('input[name="name"]').value,
            content: document.querySelector('input[name="content"]').value
        }

        let data = JSON.stringify({
            "data": {
                "Name": inputValues.name ? inputValues.name : 'Без имени',
                "Content": inputValues.content ? inputValues.content : ''
            }
        });

        let config = {
            method: id ? 'put' : 'post',
            url: `${process.env.REACT_APP_BACKEND}/api/plants/${id ? id : ''}`,
            headers: {
                'Authorization': 'Bearer ' + auth.getToken(),
                'Content-Type': 'application/json'
            },
            data : data
        };

        if (eventType === 'submit') {
            axios(config)
                .then(function (response) {
                    navigate(`/plants/${response.data.data.id}`)
                    // console.log(`Растение ${id ? 'обновленно' : 'созданно'}: `, JSON.stringify(response.data));
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    }

    return (
        <div className="App-main App-main_type_edit">
            <div className="App-container">
                <form className="App-edit-form" onSubmit={onSubmit}>
                    <input type="text" name="name" onChange={onSubmit} placeholder="Название"/>
                    <input type="text" name="content" onChange={onSubmit} placeholder="Описание"/>
                    <select name="categories" multiple onChange={function (e) {
                        // !TODO: Нужно вывести select с множественным выбором (для категорий)
                    }}>
                        {categories.map(({ id, attributes }) => (
                            <option value={id} key={id}>{attributes.Name}</option>
                        ))}
                    </select>
                    <button type="submit">Создать</button>
                </form>
            </div>
        </div>
    )
};

export default EditPlantPage;
