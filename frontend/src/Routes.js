import React from "react";
import { Route, Routes } from 'react-router-dom';

// Primary routes
import SignIn from "./routes/SignIn";
import PrivateRoute from "./routes/PrivateRoute";

// Secondary routes
import Home from './routes/Home';
import Plant from "./routes/Plant";
import TestView from './routes/TestView';
import Error from "./routes/Error";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/" element={<PrivateRoute />}>
                <Route path="" element={<Home />} />
                <Route path="plants/:id" element={<Plant />} />
                <Route path="test" element={<TestView />} />
            </Route>
            <Route path="*" element={<Error/>}/>
        </Routes>
    );
};

export default AppRoutes;