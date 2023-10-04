import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from "react-router-dom";
import {HelmetProvider} from 'react-helmet-async';

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
            <AuthProvider>
                <Router>
                    <App />
                </Router>
            </AuthProvider>
        </HelmetProvider>
    </React.StrictMode>
);
