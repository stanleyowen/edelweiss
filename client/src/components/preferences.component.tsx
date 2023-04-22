import React, { useState, useEffect } from 'react';
import { Button, Accordion, AccordionSummary } from '@mui/material';

import Theme from '../lib/theme.json';
import { Themes, Expand, ThemesApp } from '../lib/icons.component';

// eslint-disable-next-line
const About = () => {
    const [activeTab, setActiveTab] = useState<string>(
        JSON.parse(localStorage.getItem('theme-session') || `{}`).type
    );

    const setTheme = (type: string, url: string | boolean) => {
        setActiveTab(type);
        const background = document.getElementById('backdrop-image');
        if (url && background) background.style.background = `url(${url})`;
        else background?.removeAttribute('style');
        localStorage.setItem('theme-session', JSON.stringify({ type, url }));
    };

    useEffect(() => {
        document.getElementById('themes')?.childNodes.forEach((tab) => {
            const childId = tab.textContent?.toLowerCase();
            if (childId && activeTab) {
                if (activeTab.toLowerCase() === childId)
                    document.getElementById(childId)?.classList.add('active');
                else
                    document
                        .getElementById(childId)
                        ?.classList.remove('active');
            }
        });
    }, [activeTab]);

    return (
        <div className="m-10" id="version">
            <Accordion className="w-100 card mt-10">
                <AccordionSummary expandIcon={<Expand />}>
                    <div className="flex w-80">
                        <Themes />
                        <p className="ml-10">Themes</p>
                    </div>
                </AccordionSummary>
                <div className="p-10" id="themes">
                    {Theme.map((theme) => {
                        return (
                            <Button
                                className="w-25"
                                id={theme.type.toLowerCase()}
                                key={theme.type.toLowerCase()}
                                onClick={() =>
                                    setTheme(theme.type, theme.image)
                                }
                            >
                                <div>
                                    <div className="m-auto">
                                        <ThemesApp />
                                    </div>
                                    {theme.type}
                                </div>
                            </Button>
                        );
                    })}
                </div>
            </Accordion>
        </div>
    );
};

export default About;
