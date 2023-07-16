import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "antd";
import {
    UserOutlined
} from '@ant-design/icons';


// Context
import { useAuthContext } from "../../context/AuthContext";

// Helpers
import { removeToken } from "../../helpers";

// Components
import Logo from "../Logo"

// Styles
import './styles.css'

const AppHeader = () => {
    const { user } = useAuthContext();
    const navigate = useNavigate();

    const [auth, setAuth] = useState(0);

    useEffect(() => {
        if (user) {
            setAuth(1)
        }
    }, [user, setAuth]);

    const handleLogout = () => {
        setAuth(0)
        removeToken();
        navigate("/signin", { replace: true });
    };

    return (
        <div className="app-header-grid">
            <div className="app-header-grid__col">
                <Link to="/">
                    <Logo />
                </Link>
            </div>
            <div className="app-header-grid__col">
                {auth ? (
                    <div className="app-header-auth">
                        <div className="app-header-auth__info">
                            <UserOutlined className="app-header-auth__icon" />
                            <div className="app-header-auth__username">
                                {user.username}
                            </div>
                        </div>
                        <Button
                            className="app-header-auth__button"
                            type="primary"
                            onClick={handleLogout}
                        >
                            Выйти
                        </Button>
                    </div>
                ) : false}
            </div>
        </div>
    );
};

export default AppHeader;