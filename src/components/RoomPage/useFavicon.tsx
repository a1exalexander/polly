'use client';

import { StoryStatusTypes } from '@/components/RoomPage/RoomPage.store';
import { useEffect } from 'react';

const getFaviconPath = (status: StoryStatusTypes) => {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    const faviconHref = favicon.href;
    const faviconPath = faviconHref.split('/').slice(0, -1).join('/');

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
        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        favicon.href = getFaviconPath(status);
    }

    useEffect(() => {
        setFavicon(status);
    }, [status]);
}
