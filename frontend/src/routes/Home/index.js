import React from 'react';
import {
    Card,
} from "antd";

// Components
import PlantsGrid from "../../components/PlantsGrid";

// Styles
import './styles.css';

const Home = () => {
    return (
        <Card className="app-card card-home" title="Растения">
            <PlantsGrid />
        </Card>
    );
}

export default Home;