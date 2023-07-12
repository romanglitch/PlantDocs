import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

// Components
import Header from '../../components/Header';
import Footer from '../../components/Footer';

// Routes
import AuthPage from '../AuthPage';
import HomePage from '../HomePage';
import PlantPage from '../PlantPage';
import NotFoundPage from '../NotFoundPage';
import PrivateRoute from '../PrivateRoute';

// Design
import './styles.css';

const App = () => {
    return (
        <Router>
            <div className="App">
                <Header />
                <Routes>
                    {/* A user can't go to the HomePage if is not authenticated */}
                    <Route path="/auth/:authType/:id" element={<AuthPage/>}/>
                    <Route path="/auth/:authType" element={<AuthPage/>}/>
                    <Route exact path='/' element={<PrivateRoute/>}>
                        <Route exact path='/' element={<HomePage/>}/>
                        <Route exact path="/plants/:id" element={<PlantPage/>}/>
                    </Route>
                    <Route path="*" element={<NotFoundPage/>}/>
                </Routes>
                <Footer />
            </div>
        </Router>
    );
}

export default App;