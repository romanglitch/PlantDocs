import React from 'react';
import { Button, Result, Card } from 'antd';

// Styles
import './styles.css'

const Error = () => {
    return (
        <Card className="app-card card-error">
            <Result
                status="404"
                title="Ну и что здесь ?...."
                subTitle="Извините, но данной страницы не существует"
                extra={
                    <Button type="primary" href={'/'}>Вернуться на главную</Button>
                }
            />
        </Card>
    );
}

export default Error;
