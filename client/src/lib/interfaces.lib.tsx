export interface EnvConfiguration {
    apiKey: string | undefined;
    authDomain: string | undefined;
    projectId: string | undefined;
    appId: string | undefined;
    measurementId: string | undefined;
}

export interface AuthInterface {
    config: EnvConfiguration;
    handleCredential: any;
}

export interface HandleCredential {
    id: 'isLoading' | 'loggedIn';
    value: boolean;
}

export interface HandleCredentialAuth {
    isLoading: boolean;
    loggedIn: boolean;
}
