import { StoryStatus } from '@/components/RoomPage/RoomPage.store';
import { useEffect } from 'react';

const getFaviconPath = (status: StoryStatus) => {
    if (typeof window === 'undefined') {
        return '';
    }
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    const faviconHref = favicon.href;
    const faviconPath = faviconHref.split('/').slice(0, -1).join('/');

    switch (status) {
        case 'idle':
            return `${faviconPath}/favicon.png`;
        case 'active':
            return `${faviconPath}/favicon-2.png`;
        case 'finished':
            return `${faviconPath}/favicon-3.png`;
    }
}

export const useFavicon = (status: StoryStatus) => {
    const setFavicon = (status: StoryStatus) => {
        if (typeof window === 'undefined') {
            return;
        }
        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        favicon.href = getFaviconPath(status);
    }

    useEffect(() => {
        setFavicon(status);
    }, [status]);
}
