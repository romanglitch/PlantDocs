import React from 'react';
import {Card} from "antd";

// Routes
// ...

// Components
import AppCardTitle from "../../components/AppCardTitle";

// Styles
import './styles.css'

// Functions & variables
// ...

const RouteName = () => {
    return (
        <Card className="app-card card-name" title={AppCardTitle('Title text')}>
            Test
        </Card>
    );
}

export default RouteName;
