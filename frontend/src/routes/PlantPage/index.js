import React from 'react';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {Card} from "antd";

// Components
import AppCardTitle from "../../components/AppCardTitle";

// Styles
import './styles.css'

const PlantPage = () => {
    const [plantsPage, setPlantsPage] = useState([]);

    const {id} = useParams();

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_BACKEND}/api/plants/${id}`)
            .then(({ data }) => setPlantsPage(data.data.attributes))
            .catch((error) => console.log(error));
    }, [id]);

    return (
        <Card className="app-card card-plant" title={AppCardTitle(plantsPage.Name)}>
            Test
        </Card>
    );
}

export default PlantPage;
