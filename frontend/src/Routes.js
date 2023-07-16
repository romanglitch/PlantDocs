import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Routes
import SignIn from "./routes/SignIn";
import Home from './routes/Home';
import TestView from './routes/TestView';

// Helpers
import { getToken } from "./helpers";

const AppRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={getToken() ? <Home /> : <Navigate to="/signin" />}
            />
            <Route
                path="/test"
                element={getToken() ? <TestView /> : <Navigate to="/signin" />}
            />
            <Route path="/signin" element={<SignIn />} />
        </Routes>
    );
};

export default AppRoutes;