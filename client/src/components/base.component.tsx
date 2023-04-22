import React from 'react';

import Logs from './logs.component';
import Path from './logs-path.component';
import Home from './home.component';
import Settings from './settings.component';
import Environment from './env.component';

// eslint-disable-next-line
const BaseLayout = ({
    properties,
    songData,
    HOST_DOMAIN,
    handleChange,
}: any) => {
    return (
        <div className="base">
            {properties.activeTab === 'home' ? (
                <Home
                    properties={properties}
                    songData={songData}
                    HOST_DOMAIN={HOST_DOMAIN}
                    handleChange={handleChange}
                />
            ) : properties.activeTab === 'logs' ? (
                <Logs properties={properties} HOST_DOMAIN={HOST_DOMAIN} />
            ) : properties.activeTab === 'path' ? (
                <Path properties={properties} HOST_DOMAIN={HOST_DOMAIN} />
            ) : properties.activeTab === 'environment' ? (
                <Environment
                    properties={properties}
                    HOST_DOMAIN={HOST_DOMAIN}
                />
            ) : (
                <Settings />
            )}
        </div>
    );
};

export default BaseLayout;
