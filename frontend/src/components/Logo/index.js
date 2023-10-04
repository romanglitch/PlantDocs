import React from 'react';
import LogoSVG from './Logo.svg';

// Styles
import './styles.css';

const Logo = () => {
    return (
        <div className="app-logo">
            <img className="app-logo__image" src={LogoSVG} alt="PlantDocs - plants & docs application" />
        </div>
    );
}

export default Logo;
