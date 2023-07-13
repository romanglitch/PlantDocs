/**
 *
 * HomePage
 */

import React from 'react';
import Plants from '../../components/Plants';

export default function HomePage() {
    return (
        <div className="App-main App-main_type_home">
            <div className="App-container">
                <Plants />
            </div>
        </div>
    );
}
