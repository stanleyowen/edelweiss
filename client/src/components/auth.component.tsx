import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { initializeApp } from 'firebase/app';
import { generateToken } from '../lib/functions.component';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { Alert, Slide, Snackbar, SlideProps } from '@mui/material';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { AuthInterface } from '../lib/interfaces.lib';

type TransitionProps = Omit<SlideProps, 'direction'>;

const Auth = ({ config, handleCredential }: AuthInterface) => {
    initializeApp(config);

    const [status, setStatus] = useState<{
        isError: boolean;
        message:
            | null
            | 'Invalid Credentials'
            | 'Something Went Wrong. Please Try Again Later.'
            | 'No Whitelisted Emails are Found. Retrying in 10 seconds...';
    }>({
        isError: false,
        message: 'Invalid Credentials',
    });
    const [isLoading, setLoading] = useState<boolean>(false);
    const [transition, setTransition] = useState<
        React.ComponentType<TransitionProps> | undefined
    >(undefined);

    async function loadUsers(callback: (users: string) => void) {
        const data = await getDoc(
            doc(getFirestore(), 'thalia-tiffany', 'emails')
        );
        if (data.exists()) callback(JSON.stringify(Object.keys(data.data())));
        else {
            setStatus({
                isError: true,
                message:
                    'No Whitelisted Emails are Found. Retrying in 10 seconds...',
            });
            setTimeout(
                () =>
                    setStatus({
                        isError: false,
                        message: null,
                    }),
                5000
            );
        }
    }

    function parseError() {
        setLoading(false);
        setStatus({
            isError: true,
            message: 'Something Went Wrong. Please Try Again Later.',
        });
        setTimeout(
            () =>
                setStatus({
                    isError: false,
                    message: null,
                }),
            5000
        );
    }

    return (
        <div>
            <div className="backdrop-overlay"></div>
            <div className="backdrop">
                <div className="acrylic-material"></div>
                <div className="backdrop-image" id="backdrop-image"></div>
            </div>

            <div className="bg-white container p-10 rounded-corner">
                <h3 className="center-align mb-10">Welcome Back!</h3>
                <LoadingButton
                    variant="outlined"
                    className="mt-10 w-100"
                    loading={isLoading}
                    onClick={() => {
                        setLoading(true);
                        signInWithPopup(getAuth(), new GoogleAuthProvider())
                            .then((result) => {
                                let isAuth = false;
                                function Transition(props: TransitionProps) {
                                    return (
                                        <Slide {...props} direction="right" />
                                    );
                                }

                                function parseData() {
                                    loadUsers((users) => {
                                        if (JSON.parse(users).length > 0) {
                                            JSON.parse(users).forEach(
                                                (
                                                    email: string,
                                                    index: number
                                                ) => {
                                                    if (
                                                        result.user.email ===
                                                        email
                                                    ) {
                                                        isAuth = true;
                                                        generateToken(
                                                            result.user.email
                                                        );
                                                        handleCredential({
                                                            id: 'isLoading',
                                                            value: false,
                                                        });
                                                    } else if (
                                                        !isAuth &&
                                                        index ===
                                                            JSON.parse(users)
                                                                .length -
                                                                1
                                                    ) {
                                                        setLoading(false);
                                                        setStatus({
                                                            isError: true,
                                                            message:
                                                                'Invalid Credentials',
                                                        });
                                                        handleCredential({
                                                            id: 'isLoading',
                                                            value: false,
                                                        });
                                                        setTimeout(
                                                            () =>
                                                                setStatus({
                                                                    isError:
                                                                        false,
                                                                    message:
                                                                        null,
                                                                }),
                                                            5000
                                                        );
                                                    }
                                                }
                                            );
                                        } else
                                            setTimeout(
                                                () => parseData(),
                                                10000
                                            );
                                    });
                                }

                                setTransition(() => Transition);

                                if (result) parseData();
                                else parseError();
                            })
                            .catch(() => parseError());
                    }}
                >
                    Sign in with Google
                </LoadingButton>
            </div>

            <Snackbar open={status.isError} TransitionComponent={transition}>
                <Alert severity="error">{status.message}</Alert>
            </Snackbar>
        </div>
    );
};

export default Auth;
