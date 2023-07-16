import React, { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Button,
    Card,
    Form,
    Input,
    message,
    Spin,
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
        setIsLoading(true);
        try {
            const value = {
                identifier: values.email,
                password: values.password,
            };
            const response = await fetch(`${API}/auth/local`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(value),
            });

            const data = await response.json();
            if (data?.error) {
                throw data?.error;
            } else {
                // set the token
                setToken(data.jwt);

                // set the user
                setUser(data.user);

                message.success(`Добро пожаловать, ${data.user.username}!`);

                navigate("/", { replace: true });
            }
        } catch (error) {
            console.error(error);
            setError(error?.message ?? "Упс :) что-то пошло не так...");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Fragment>
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
                            Войти {isLoading && <Spin size="small" />}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </Fragment>
    );
};

export default SignIn;