import React from 'react';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Card } from "antd";

// Components
import AppCardTitle from "../../components/AppCardTitle";

// Styles
import './styles.css'

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

    console.log({plantPage, history})

    return (
        <Card className="app-card card-plant" title={AppCardTitle(plantPage.Name)}>
            Card-plant content
        </Card>
    );
}

export default PlantPage;
