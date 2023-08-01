import React, { useState, useEffect } from "react";
import { Route, Routes, useLocation } from 'react-router-dom';

// Primary routes
import SignIn from "./routes/SignIn";
import PrivateRoute from "./routes/PrivateRoute";

// Secondary routes
import Home from './routes/Home';
import Plant from "./routes/Plant";
import TestView from './routes/TestView';
import Error from "./routes/Error";


const AppRoutes = () => {
    const location = useLocation();
    const [displayLocation, setDisplayLocation] = useState(location);
    const [transitionStage, setTransitionStage] = useState('fadeIn');

    useEffect(() => {
        if (location !== displayLocation) setTransitionStage('fadeOut');
    }, [location, displayLocation]);

    return (
        <div
            className={`${transitionStage}`}
            onAnimationEnd={() => {
                if (transitionStage === 'fadeOut') {
                    setTransitionStage('fadeIn');
                    setDisplayLocation(location);
                }
            }}
        >
            <Routes location={displayLocation}>
                <Route path="/signin" element={<SignIn />} />
                <Route path="/" element={<PrivateRoute />}>
                    <Route path="" element={<Home />} />
                    <Route path="plants/:id" element={<Plant />} />
                    <Route path="test" element={<TestView />} />
                </Route>
                <Route path="*" element={<Error/>}/>
            </Routes>
        </div>
    );
};

export default AppRoutes;