/**
 *
 * AuthPage
 *
 */

import React, {useState} from 'react';
import {get} from 'lodash';
import {useParams, useNavigate} from 'react-router-dom';

// Utils
import auth from '../../utils/auth';
import request from '../../utils/request';

import './styles.css';

const getRequestURL = (authType) => {
    let requestURL;

    switch (authType) {
        case 'login':
            requestURL = 'http://localhost:1337/api/auth/local';
            break;
        default:
    }

    return requestURL;
};

export default function AuthPage() {
    let [state, setState] = useState({value: {}, errors: [], didCheckErrors: false});
    let {authType} = useParams();
    const navigate = useNavigate();

    const handleChange = ({target}) => setState({
        value: {...state.value, [target.name]: target.value},
    });

    const handleSubmit = e => {
        e.preventDefault();
        const body = state.value;
        const requestURL = getRequestURL(authType);

        request(requestURL, {method: 'POST', body: state.value})
            .then(response => {
                auth.setToken(response.jwt, body.rememberMe);
                auth.setUserInfo(response.user, body.rememberMe);
                alert("Auth success")
                redirectUser();
            })
            .catch(err => {
                // This is just an example
                const errors = [
                    {name: 'identifier', errors: [err.response.payload.error.message]},
                ];
                setState({...state.value, didCheckErrors: !state.didCheckErrors, errors});
            });
    };

    const redirectUser = () => {
        navigate(`/`);
    };

    return (
        <div className="App-main App-main_type_auth">
            <div className="App-container">
                <form className="App-auth-form" onSubmit={handleSubmit}>
                    <label>
                        <b>Username / E-mail:</b>
                        <input
                            name="identifier"
                            onChange={handleChange}
                            placeholder="johndoe@gmail.com"
                            type="text"
                            value={get(state.value, 'identifier', '')}
                        />
                    </label>

                    <label>
                        <b>Password:</b>
                        <input
                            name="password"
                            onChange={handleChange}
                            type="text"
                            value={get(state.value, 'password', '')}
                        />
                    </label>

                    <label>
                        <b>Remember me</b>
                        <input
                            name="rememberMe"
                            onChange={handleChange}
                            type="checkbox"
                            value={get(state.value, 'rememberMe', '')}
                        />
                    </label>

                    <button type="submit">Войти</button>
                </form>
            </div>
        </div>
    );
}
