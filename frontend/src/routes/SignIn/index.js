import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Alert,
    Button,
    Card,
    Form,
    Input
} from "antd";

// Context
import { useAuthContext } from "../../context/AuthContext";

// Constants
import { API } from "../../constant";

// Helpers
import { setToken } from "../../helpers";

// Styles
import './styles.css'

const SignIn = () => {
    const navigate = useNavigate();

    const { setUser } = useAuthContext();

    const [isLoading, setIsLoading] = useState(false);

    const [error, setError] = useState("");

    const onFinish = async (values) => {
        const value = {
            identifier: values.email,
            password: values.password,
        };

        setIsLoading(true);

        await axios({
            method: 'post',
            url: `${API}/auth/local`,
            headers: {
                "Content-Type": "application/json",
            },
            data: value
        }).then(function (response) {
            // set the token
            setToken(response.data.jwt);

            // set the user
            setUser(response.data.user);

            navigate('/', { replace: true });

            setIsLoading(false);
        }).catch(function (error) {
            console.error(error);
            setError(error?.message ?? "Something went wrong!");
        });
    };

    return (
        <Card className="app-card card-signin" title="Вход">
            {error ? (
                <Alert
                    className="alert_error"
                    message={error}
                    type="error"
                    closable
                    afterClose={() => setError("")}
                />
            ) : null}
            {isLoading ? 'Loading...' : false}
            <Form
                name="basic"
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
            >
                <Form.Item
                    label="Адрес эл. почты"
                    name="email"
                    rules={[
                        {
                            required: true,
                            type: "email",
                        },
                    ]}
                >
                    <Input placeholder="Email address" />
                </Form.Item>

                <Form.Item
                    label="Пароль"
                    name="password"
                    rules={[{ required: true }]}
                >
                    <Input.Password placeholder="Password" />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="login_submit_btn"
                    >
                        Войти
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default SignIn;