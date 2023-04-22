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
    const musicSession = JSON.parse(
        localStorage.getItem('music-session') || '{}'
    );
    const [data, setData] = useState<any>([]);
    const [rawData, setRawData] = useState<any>({});
    const [isOffline, setConnectionState] = useState<boolean>(false);
    const [transition, setTransition] = useState<
        React.ComponentType<TransitionProps> | undefined
    >(undefined);
    const [song, setSong] = useState({
        playing: false,
        title: musicSession.title ? musicSession.title : 'Underwater',
        author: musicSession.author ? musicSession.author : 'LiQWYD',
        image: musicSession.image
            ? HOST_DOMAIN + musicSession.image
            : 'https://user-images.githubusercontent.com/69080584/129511233-dd5a0eac-2675-415e-ae4c-6cc530a23629.png',
        audio: musicSession.audio
            ? new Audio(musicSession.audio)
            : new Audio(
                  'https://user-images.githubusercontent.com/69080584/129511300-e88655e9-687f-4d0b-acb4-b32c0fa988cf.mp4'
              ),
    });

    useEffect(() => {
        initializeApp(config);
        onValue(ref(getDatabase(), 'loofi-music/'), (snapshot) => {
            const data = snapshot.val();
            setRawData(snapshot.val());
            let index = data ? data.length : 0,
                randIndex;
            while (index !== 0) {
                randIndex = Math.floor(Math.random() * index);
                index--;
                [data[index], data[randIndex]] = [data[randIndex], data[index]];
            }
            setData(data);
        });

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

    const handleSong = useCallback(
        (a: any) => {
            if (!a.id && !a.value) {
                localStorage.setItem('music-session', JSON.stringify(a));
                a.audio === song.audio.getAttribute('src')
                    ? setSong({ ...song, playing: !song.playing })
                    : setSong({
                          ...a,
                          audio: new Audio(a.audio),
                          image: HOST_DOMAIN + a.image,
                          playing: true,
                      });
            } else setSong({ ...song, [a.id]: a.value });
        },
        [song]
    );

    return (
        <div>
            {data.length === 0 ? <LinearProgress /> : null}
            <div
                className="app"
                style={data.length === 0 ? { height: '99.3vh' } : {}}
            >
                <Navbar properties={properties} handleChange={handleChange} />
                <BaseLayout
                    song={song}
                    songData={data}
                    rawSongData={rawData}
                    handleSong={handleSong}
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
