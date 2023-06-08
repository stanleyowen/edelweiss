import React, { useState, useEffect } from 'react';
import { License, MusicOutline, SettingsOutline } from '../lib/icons.component';

const Home = ({ properties, handleChange }: any) => {
    const [greeting, setGreeting] = useState<string>();

    useEffect(() => {
        const currentHour = new Date().getHours();
        if (currentHour < 12) setGreeting('Morning');
        else if (currentHour < 18) setGreeting('Afternoon');
        else setGreeting('Evening');
    }, []);

    const switchTab = (target: string) => {
        if (target !== properties.activeTab)
            handleChange({ id: 'activeTab', value: target });
    };

    return (
        <div className="m-10">
            <h2>Good {greeting}</h2>
            <div className="col-3 mt-10">
                <button
                    className="card p-10"
                    onClick={() => switchTab('environment')}
                >
                    <h2 className="center-align">{License()}</h2>
                    <p className="center-align">Data</p>
                </button>
                <button
                    className="card p-10"
                    onClick={() => switchTab('settings')}
                >
                    <h2 className="center-align">{SettingsOutline()}</h2>
                    <p className="center-align">Settings</p>
                </button>
            </div>
        </div>
    );
};

export default Home;
