import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { initializeApp } from '@firebase/app';
import { getTokenValue } from './lib/functions.component';
import { LinearProgress, CircularProgress } from '@mui/material';
import { getAuth, onAuthStateChanged } from '@firebase/auth';
import { onSnapshot, getFirestore, doc } from 'firebase/firestore';

import SideBar from './components/sidebar.component';
import Auth from './components/auth.component';
import AppLayout from './components/app.component';
import { EnvConfiguration } from './lib/interfaces.lib';

process.env.NODE_ENV === 'production'
    ? require('./App.min.css')
    : require('./App.css');

// eslint-disable-next-line
export default function App() {
    const [properties, setProperties] = useState<any>({
        action: 0,
        activeTab: window.localStorage.getItem('tab-session') ?? 'home',
        history: [window.localStorage.getItem('tab-session') ?? 'home'],
    });
    const [auth, setAuth] = useState<{
        isLoading: boolean;
        loggedIn: boolean;
    }>({
        isLoading: true,
        loggedIn: false,
    });

    const config: EnvConfiguration = {
        apiKey: process.env.REACT_APP_API_KEY,
        authDomain: process.env.REACT_APP_AUTH_DOMAIN,
        projectId: process.env.REACT_APP_PROJECT_ID,
        appId: process.env.REACT_APP_ID,
        measurementId: process.env.REACT_APP_MEASUREMENT_ID,
    };

    useEffect(() => {
        initializeApp(config);
        const userEmail = getTokenValue('email')?.split('@')[0] + '-token';
        const userToken = getTokenValue('token');

        if (userEmail && userToken)
            onSnapshot(
                doc(getFirestore(), 'thalia-tiffany', String(userEmail)),
                (token) => {
                    if (
                        token &&
                        token.data() &&
                        String(token.data()?.token) === userToken
                    )
                        setAuth({
                            isLoading: false,
                            loggedIn: true,
                        });
                    else
                        handleCredential({
                            id: 'isLoading',
                            value: false,
                        });
                }
            );
        else handleCredential({ id: 'isLoading', value: false });

        onAuthStateChanged(getAuth(), () => {
            // Leave it blank
        });
    }, []);

    useEffect(() => {
        const { isLoading, loggedIn } = auth;
        if (!isLoading) {
            if (!loggedIn && !window.location.pathname.startsWith('/auth'))
                location.href = '/auth';
            else if (loggedIn && window.location.pathname.startsWith('/auth'))
                location.href = '/';
        }
    }, [auth]);

    const handleCredential = useCallback((a: any) => {
        if (a.id && a.value) setAuth({ ...auth, [a.id]: a.value });
        else setAuth(a);
    }, []);

    const handleChange = useCallback(
        (a: any) => {
            if (a.goForward || a.goBackward)
                setProperties({
                    ...properties,
                    action: a.goBackward
                        ? properties.action - 1
                        : properties.action + 1,
                    [a.id]: a.value,
                });
            else {
                properties.history.splice(
                    properties.action + 1,
                    properties.history.length - (properties.action + 1),
                    a.value
                );
                setProperties({
                    ...properties,
                    action: properties.action + 1,
                    [a.id]: a.value,
                });
            }
            window.localStorage.setItem('tab-session', a.value);
        },
        [properties]
    );

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        auth.loggedIn ? (
                            <div>
                                <SideBar
                                    properties={properties}
                                    handleChange={handleChange}
                                />
                                <AppLayout
                                    auth={auth}
                                    config={config}
                                    properties={properties}
                                    handleChange={handleChange}
                                />
                            </div>
                        ) : (
                            <div>
                                <LinearProgress />
                                <div className="backdrop-overlay"></div>
                                <div className="backdrop">
                                    <div className="acrylic-material"></div>
                                    <div
                                        className="backdrop-image"
                                        id="backdrop-image"
                                    ></div>
                                </div>
                                <div className="bg-white container p-10 rounded-corner w-auto p-15">
                                    <CircularProgress className="m-auto" />
                                </div>
                            </div>
                        )
                    }
                />
                <Route
                    path="/auth"
                    element={
                        <Auth
                            config={config}
                            handleCredential={handleCredential}
                        />
                    }
                />
            </Routes>
        </Router>
    );
}
