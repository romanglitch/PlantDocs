import React from 'react';
import { Link } from "react-router-dom";
import {Card} from "antd";

// Components
import AppCardTitle from "../../components/AppCardTitle";

// Styles
import './styles.css'

const Error = () => {
    return (
        <Card className="app-card card-error" title={AppCardTitle('Ошибка')}>
            Страница не найдена (<Link to={'/'}>Вернуться на главную</Link>)
        </Card>
    );
}

export default Error;
