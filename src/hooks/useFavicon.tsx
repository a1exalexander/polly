'use client';

import { StoryStatusTypes } from '@/components/RoomPage/RoomPage.store';
import { useEffect } from 'react';

const getFaviconPath = (status: StoryStatusTypes, href: string) => {
    const faviconPath = href.split('/').slice(0, -1).join('/');

    switch (status) {
        case StoryStatusTypes.IDLE:
            return `${faviconPath}/favicon.png`;
        case StoryStatusTypes.ACTIVE:
            return `${faviconPath}/favicon-2.png`;
        case StoryStatusTypes.FINISHED:
            return `${faviconPath}/favicon-3.png`;
    }
}

export const useFavicon = (status: StoryStatusTypes) => {
    const setFavicon = (status: StoryStatusTypes) => {
        const favicons = document.querySelectorAll('link[rel="icon"]') as NodeListOf<HTMLLinkElement>;
        favicons.forEach(favicon => {
            favicon.href = getFaviconPath(status, favicon.href);
        });
    }

    useEffect(() => {
        setFavicon(status);
    }, [status]);
}
