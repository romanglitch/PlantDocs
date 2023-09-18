import React from 'react';

import {
    Card,
} from "antd";

// Components
import AppCardTitle from "../../components/AppCardTitle";

// Styles
import './styles.css';

const TestView = () => {
    return (
        <Card className="app-card card-test" title={AppCardTitle('Test')}>
            test
        </Card>
    );
}

export default TestView;
