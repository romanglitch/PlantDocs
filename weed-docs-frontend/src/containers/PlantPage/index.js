/**
 *
 * PlantPage
 */

import React from 'react';
import axios from "axios";
import { useEffect, useState } from "react";

const PlantPage = () => {
    const [error, setError] = useState(null);
    const [plantsPage, setPlantsPage] = useState([]);

    // !TODO: Получение ID и отображение нужного растения

    useEffect(() => {
        axios
            .get("http://localhost:1337/api/plants/1")
            .then(({ data }) => {
                setPlantsPage(data.data.attributes)
            })
            .catch((error) => setError(error));
    }, []);



    if (error) {
        // Print errors if any
        return <div>An error occured: {error.message}</div>;
    }

    return (
        <div className="plant-page">
            <div className="plant-page__name">
                {plantsPage.Name}
            </div>
            <div className="plant-page__content">
                {plantsPage.Content}
            </div>
        </div>
    );
};

export default PlantPage;
