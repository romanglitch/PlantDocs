/**
 *
 * HomePage
 */

import React from 'react';
import {useNavigate, Link} from 'react-router-dom';

import Button from '../../components/Button';
import Plants from '../../components/Plants';
import auth from '../../utils/auth';

export default function HomePage() {
    const navigate = useNavigate()

    return (
        <div className="homepage">
            <h1 className="homepage__title">
                Привет!
                <br></br>Домашняя страница
            </h1>
            <div className="homepage__actions">
                <Button
                    primary
                    onClick={() => {
                        auth.clearAppStorage();
                        navigate('/auth/login');
                    }}
                >
                    Logout
                </Button>
                <Link to={process.env.REACT_APP_BACKEND}>To admin</Link>
            </div>
            <h2 className="homepage__subtitle">Твои растишки!</h2>
            <div className="homepage__plants">
                <Plants />
            </div>
        </div>
    );
}
