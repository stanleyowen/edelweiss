import React, { useState, useEffect } from 'react';
import { MusicOutline, SettingsOutline } from '../lib/icons.component';

const Home = ({ song, properties, handleChange }: any) => {
    const [greeting, setGreeting] = useState<string>();

    useEffect(() => {
        const currentHour = new Date().getHours();
        if (currentHour < 12) setGreeting('Morning');
        else if (currentHour < 18) setGreeting('Afternoon');
        else setGreeting('Evening');
    }, []);

    useEffect(() => {
        const btn = document.getElementById(
            (song.title + song.author).replace(/\s/g, '-')
        );
        song.playing
            ? btn?.classList.add('pause')
            : btn?.classList.remove('pause');
    }, [song]);

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
                    onClick={() => switchTab('music')}
                >
                    <h2 className="center-align">{MusicOutline()}</h2>
                    <p className="center-align">Music</p>
                </button>
                <button
                    className="card p-10"
                    onClick={() => switchTab('settings')}
                >
                    <h2 className="center-align">{SettingsOutline()}</h2>
                    <p className="center-align">Settings</p>
                </button>
                <button className="card p-10">
                    <h2 className="center-align">-</h2>
                    <p className="center-align">Music</p>
                </button>
            </div>
        </div>
    );
};

export default Home;
