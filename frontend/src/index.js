import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from "react-router-dom";
import {HelmetProvider} from 'react-helmet-async';

import ruRU from "antd/locale/ru_RU";
import {ConfigProvider} from "antd";

// Routes
import App from './routes/App';

// Components
import AuthProvider from "./components/AuthProvider";

// Styles
import './index.css';

const root = ReactDOM.createRoot(document.querySelector('.app'));

root.render(
    <React.StrictMode>
        <HelmetProvider>
                <Router>
                    <AuthProvider>
                        <ConfigProvider
                            locale={ruRU}
                            theme={{
                                token: {
                                    colorPrimary: '#5A54F9',
                                },
                            }}
                        >
                            <App />
                        </ConfigProvider>
                    </AuthProvider>
                </Router>
        </HelmetProvider>
    </React.StrictMode>
);
