import React, { useState, useEffect, useCallback } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import {
    Alert,
    Slide,
    Snackbar,
    LinearProgress,
    SlideProps,
} from '@mui/material';
import { initializeApp } from '@firebase/app';

import Navbar from './navbar.component';
import BaseLayout from './base.component';

type TransitionProps = Omit<SlideProps, 'direction'>;

// eslint-disable-next-line
const App = ({ properties, handleChange, config }: any) => {
    const HOST_DOMAIN: string =
        process.env.REACT_APP_HOST_DOMAIN ?? window.location.origin;
    const [data, setData] = useState<any>([]);
    const [rawData, setRawData] = useState<any>({});
    const [isOffline, setConnectionState] = useState<boolean>(false);
    const [transition, setTransition] = useState<
        React.ComponentType<TransitionProps> | undefined
    >(undefined);

    useEffect(() => {
        initializeApp(config);

        if (document.readyState === 'complete') {
            onValue(ref(getDatabase(), '.info/connected'), (snapshot) => {
                function Transition(props: TransitionProps) {
                    return <Slide {...props} direction="right" />;
                }
                if (!snapshot.val()) {
                    setTransition(() => Transition);
                    setConnectionState(true);
                } else setConnectionState(false);
            });
        }

        window.onerror = (msg, url, lineNo, columnNo, error) => {
            async function sendData() {
                await addDoc(collection(getFirestore(), 'logs'), {
                    message: String(msg),
                    url: String(url),
                    location: String(lineNo) + ' ' + String(columnNo),
                    error: String(error),
                });
            }
            sendData();
            return false;
        };

        const themeURL = JSON.parse(
            localStorage.getItem('theme-session') || `{}`
        ).url;
        const backgroundElement = document.getElementById('backdrop-image');
        if (backgroundElement && themeURL)
            backgroundElement.style.background = `url(${themeURL})`;
    }, []); // eslint-disable-line

    return (
        <div>
            {data === 0 ? <LinearProgress /> : null}
            <div
                className="app"
                style={data.length === 0 ? { height: '99.3vh' } : {}}
            >
                <Navbar properties={properties} handleChange={handleChange} />
                <BaseLayout
                    songData={data}
                    rawSongData={rawData}
                    properties={properties}
                    HOST_DOMAIN={HOST_DOMAIN}
                    handleChange={handleChange}
                />
                <Snackbar open={isOffline} TransitionComponent={transition}>
                    <Alert severity="error">
                        You are offline. Some functionality may be unavailable.
                    </Alert>
                </Snackbar>
            </div>
        </div>
    );
};

export default App;
