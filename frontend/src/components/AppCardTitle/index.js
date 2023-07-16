import React from 'react';
import { Link } from "react-router-dom";
import {
    LeftOutlined
} from '@ant-design/icons';

// Styles
import './styles.css';

const AppCardTitle = (titleText) => {
    return (
        <div className="app-card-title">
            <Link className="app-card-title__link" to="/">
                <LeftOutlined style={{ color: '#000000' }} />
            </Link>
            <div className="app-card-title__text">
                {titleText}
            </div>
        </div>
    );
}

export default AppCardTitle;
