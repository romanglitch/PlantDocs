import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Helpers
import { getToken } from "./helpers";

// Routes
import SignIn from "./routes/SignIn";
import Home from './routes/Home';
import Plant from "./routes/Plant";
import TestView from './routes/TestView';
import Error from "./routes/Error";


const AppRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={getToken() ? <Home /> : <Navigate to="/signin" />}
            />
            <Route
                path="/plants/:id"
                element={getToken() ? <Plant /> : <Navigate to="/signin" />}
            />
            <Route
                path="/test"
                element={getToken() ? <TestView /> : <Navigate to="/signin" />}
            />
            <Route path="/signin" element={<SignIn />} />
            <Route path="*" element={<Error/>}/>
        </Routes>
    );
};

export default AppRoutes;