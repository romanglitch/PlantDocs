import React from "react";
import { ConfigProvider, Layout } from "antd";
import ruRU from 'antd/locale/ru_RU';

// Routes
import AppRoutes from "../../Routes";

// Components
import AppHeader from "../../components/AppHeader";

// Styles
import './styles.css'

// Functions & variables
const { Header, Content } = Layout;

const App = () => {
    return (
        <ConfigProvider
            locale={ruRU}
            theme={{
                // token: {
                //     colorPrimary: '#21D388',
                // }
            }}
        >
            <Layout className="app-layout">
                <Header className="app-header">
                    <AppHeader />
                </Header>
                <Content className="app-router">
                    <AppRoutes />
                </Content>
            </Layout>
        </ConfigProvider>
    );
}

export default App;
