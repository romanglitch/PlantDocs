/**
 *
 * PlantPage
 */

import React from 'react';
import axios from "axios";
import { useEffect, useState } from "react";
import {Link, useParams} from "react-router-dom";

const PlantPage = () => {
    const [error, setError] = useState(null);
    const [plantsPage, setPlantsPage] = useState([]);

    let {id} = useParams();

    useEffect(() => {
        axios
            .get(`http://localhost:1337/api/plants/${id}`)
            .then(({ data }) => {
                console.log(data)
                setPlantsPage(data.data.attributes)
            })
            .catch((error) => setError(error));
    }, [id]);

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
            <Link to='/'>To home</Link>
        </div>
    );
};

export default PlantPage;
