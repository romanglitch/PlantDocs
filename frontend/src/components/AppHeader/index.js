import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Popover } from "antd";
import {
    LogoutOutlined,
    DashboardOutlined,
    PicRightOutlined
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
                    <Popover content={(
                        <div className="app-header-user-content">
                            <Button className="app-header-auth__button" type={'link'} href={`${process.env.REACT_APP_BACKEND}/admin`} target={'_blank'}>
                                <DashboardOutlined /> Панель управления
                            </Button>
                            <Button className="app-header-auth__button" type={'link'} onClick={() => navigate("/docs")}>
                                <PicRightOutlined /> Документация
                            </Button>
                            <Button
                                className="app-header-auth__button"
                                type="primary"
                                onClick={handleLogout}
                            >
                                <LogoutOutlined /> Выйти
                            </Button>
                        </div>
                    )} trigger="click">
                        <div className="app-header-user">
                            <div className="app-header-user__name">
                                {user.username}
                            </div>
                            <img className="app-header-user__avatar" alt="null" src={`https://robohash.org/${user.id}.png?size=42x42`}/>
                        </div>
                    </Popover>
                ) : false}
            </div>
        </div>
    );
};

export default AppHeader;