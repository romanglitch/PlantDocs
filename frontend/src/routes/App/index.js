import React from 'react';
import { Layout, theme } from "antd";

// Routes
import AppRoutes from "../../Routes";

// Components
import AppHeader from "../../components/AppHeader";

// Styles
import './styles.css'

// Functions & variables
const { Header, Content } = Layout;

const { useToken } = theme;

const App = () => {
    const { token } = useToken();

    document.body.style = `--theme-token-colorPrimary: ${token.colorPrimary}`

    return (
        <Layout className="app-layout">
            <Header className="app-header">
                <AppHeader />
            </Header>
            <Content className="app-router">
                <AppRoutes />
            </Content>
        </Layout>
    );
}

export default App;
