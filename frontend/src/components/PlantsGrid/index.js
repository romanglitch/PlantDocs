import React, { useEffect, useState } from "react";
import {Link} from "react-router-dom";
import axios from "axios";
import { formatDate, countDays } from "../../publicHelpers";
import {
    Spin, Tag,
} from "antd";

// Styles
import './styles.css';

// Functions & variables
const { CheckableTag } = Tag;

const PlantsGrid = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [plants, setPlants] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedTags, setSelectedTags] = useState(['All']);

    let getPlantsRequest = `${process.env.REACT_APP_BACKEND}/api/plants?populate[0]=categories&populate[1]=image&populate[2]=weeks.days`;

    useEffect(() => {
        axios
            .get(getPlantsRequest)
            .then(({ data }) => {
                setPlants(data.data)
            })
            .catch((error) => setError(error));

        axios
            .get(`${process.env.REACT_APP_BACKEND}/api/categories?populate[0]=plants`)
            .then(({ data }) => {
                data.data.isPlants = false

                data.data.forEach(function (item) {
                    if (item.attributes.plants.data.length) {
                        data.data.isPlants = true
                    }
                })

                setCategories(data.data)
            })
            .catch((error) => {
                console.log(error)
                setError(error)
            })
            .finally(() => setIsLoading(false));
    }, [getPlantsRequest]);

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
            getPlantsRequest = `${process.env.REACT_APP_BACKEND}/api/plants?populate[0]=categories&populate[1]=image&populate[2]=weeks.days`

            axios
                .get(getPlantsRequest)
                .then(({ data }) => setPlants(data.data))
                .catch((error) => setError(error));
        }
    };

    return (
        <div className="app-plants">
            {isLoading ? (
                <div className="app-plant-loader">
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    {categories.isPlants ? (
                        <div className="app-plants-tags">
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
                    ) : error }
                    {plants.length ? (
                        <div className="app-plants-grid">
                            {plants.map(({ id, attributes }) => (
                                <Link className="app-plant-item" key={id} to={'/plants/' + id}>
                                    <div className="app-plant-item__content">
                                        <div className="app-plant-item__name">
                                            {attributes.Name}
                                        </div>
                                        <div className="app-plant-item__thumb">
                                            <div className="app-plant-item__days">
                                                {countDays(attributes.weeks)} дней
                                            </div>
                                            <div className="app-plant-item__date">
                                                {formatDate(attributes.updatedAt)}
                                            </div>
                                        </div>
                                        <div className="app-plant-item__categories">
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
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : error }
                </>
            )}
        </div>
    );
}

export default PlantsGrid;
