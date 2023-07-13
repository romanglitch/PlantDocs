/**
 *
 * Header
 *
 */

import React from 'react';
import {Link, useNavigate} from 'react-router-dom';

import auth from '../../utils/auth';

import './styles.css';

function Header() {
    const navigate = useNavigate()

    return (
        <div className="App-header">
            <div className="App-container">
                <div className="App-header__grid">
                    <Link className="App-header__logo" to="/">
                        WeedDocs
                    </Link>
                    {auth.getUserInfo() ? (
                        <div className="App-header__actions">
                            <Link className="App-header__link" to={process.env.REACT_APP_BACKEND + '/admin'}>Панель управления</Link>
                            <button className="App-header__button" onClick={function () {
                                auth.clearAppStorage();
                                navigate('/auth/login');
                            }}>Выйти</button>
                        </div>
                    ) : false }
                </div>
            </div>
        </div>
    );
}

export default Header;
