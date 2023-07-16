import React, { useEffect, useState } from "react";
import {Link} from "react-router-dom";
import axios from "axios";
import {
    Card,
    Descriptions,
    Tag,
} from "antd";

// Styles
import './styles.css';

// Functions & variables
const { CheckableTag } = Tag;

const PlantsGrid = () => {
    const [error, setError] = useState(null);
    const [plants, setPlants] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedTags, setSelectedTags] = useState(['All']);

    let getPlantsRequest = `${process.env.REACT_APP_BACKEND}/api/plants?populate[0]=categories&populate[1]=weeks.days`;

    useEffect(() => {
        axios
            .get(getPlantsRequest)
            .then(({ data }) => {
                setPlants(data.data)
            })
            .catch((error) => setError(error));

        axios
            .get(`${process.env.REACT_APP_BACKEND}/api/categories`)
            .then(({ data }) => setCategories(data.data))
            .catch((error) => setError(error));
    }, [getPlantsRequest]);

    if (error) {
        return <div>Ошибка: {error.message}</div>;
    }

    const tagHandleChange = (tag, checked) => {
        const nextSelectedTags = checked
            ? [...selectedTags, tag]
            : selectedTags.filter((t) => t !== tag);

        setSelectedTags(nextSelectedTags);

        if (nextSelectedTags.length > 1) {
            nextSelectedTags.forEach(function (data) {
                if (data.id) {
                    getPlantsRequest = getPlantsRequest + `&filters[categories]=${data.id}`

                    axios
                        .get(getPlantsRequest)
                        .then(({ data }) => setPlants(data.data))
                        .catch((error) => setError(error));
                }
            })
        } else {
            getPlantsRequest = `${process.env.REACT_APP_BACKEND}/api/plants?populate[0]=categories&populate[1]=weeks.days`

            axios
                .get(getPlantsRequest)
                .then(({ data }) => setPlants(data.data))
                .catch((error) => setError(error));
        }
    };

    const countDays = (weeksArray, daysCount) => {
        weeksArray.forEach(function (data) {
            daysCount = daysCount + data.days.length
        })

        return daysCount
    }

    const formatDate = (date) => {
        let formatedDate = new Date(date);
        let getDate = formatedDate.getDate();
        let dd = String(getDate).padStart(2, '0');
        let mm = String(formatedDate.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = formatedDate.getFullYear();

        formatedDate = `${dd}/${mm}/${yyyy}`

        return formatedDate
    }

    return (
        <div className="app-plants">
            {categories.length && plants.length ? (
                <div className="app-plants-tags">
                    <span className="app-plants-tags__title">Категории: </span>
                    {categories.map((tag) => (
                        <CheckableTag
                            key={tag.id}
                            checked={selectedTags.includes(tag)}
                            onChange={(checked) => tagHandleChange(tag, checked)}
                            className="app-plants-tags__item"
                        >
                            {tag.attributes.Name}
                        </CheckableTag>
                    ))}
                </div>
            ) : false }
            {plants.length ? (
                <div className="app-plants-grid">
                    {plants.map(({ id, attributes, daysCount=0 }) => (
                        <Link className="app-plant-item" key={id} to={'/plants/' + id}>
                            <Card className="app-plant-item__card" title={attributes.Name}>
                                <Descriptions className="app-plant-item__descriptions" size={'small'} column={1}>
                                    <Descriptions.Item className="app-plant-item__descriptions-item" label="Дней">
                                        {countDays(attributes.weeks, daysCount)}
                                    </Descriptions.Item>
                                    <Descriptions.Item className="app-plant-item__descriptions-item" label="Категории">
                                        {
                                            attributes.categories.data.length ? attributes.categories.data.map((cat_data) => (
                                                <Tag bordered={false} key={cat_data.id}>
                                                    {cat_data.attributes.Name}
                                                </Tag>
                                            )) : (
                                                <Tag bordered={false}>
                                                    Без категории
                                                </Tag>
                                            )
                                        }
                                    </Descriptions.Item>
                                    <Descriptions.Item className="app-plant-item__descriptions-item" label="Последнее обновление">
                                        {formatDate(attributes.updatedAt)}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : false }
        </div>
    );
}

export default PlantsGrid;
