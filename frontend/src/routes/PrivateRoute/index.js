import React from "react";
import { Navigate, Outlet } from "react-router-dom";

import {getToken} from "../../helpers";

const PrivateRoute = () => {
    return getToken() ? <Outlet /> : <Navigate to="/signin" />;
};

export default PrivateRoute;