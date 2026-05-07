'use client';

import { StoryStatusTypes } from '@/components/RoomPage/RoomPage.store';
import { useEffect } from 'react';

const STATUS_OVERRIDES: Partial<Record<StoryStatusTypes, string>> = {
    [StoryStatusTypes.ACTIVE]: '/favicon-2.png',
    [StoryStatusTypes.FINISHED]: '/favicon-3.png',
};

// Remember each <link rel="icon">'s original href (the one Next.js injected
// from the file-based metadata convention) so IDLE can restore the new primary
// favicon after a status override has rewritten it.
const originalHrefs = new WeakMap<HTMLLinkElement, string>();

export const useFavicon = (status: StoryStatusTypes) => {
    useEffect(() => {
        const favicons = document.querySelectorAll('link[rel="icon"]') as NodeListOf<HTMLLinkElement>;
        const override = STATUS_OVERRIDES[status];

        favicons.forEach(favicon => {
            if (override) {
                if (!originalHrefs.has(favicon)) {
                    originalHrefs.set(favicon, favicon.href);
                }
                favicon.href = override;
                return;
            }
            const original = originalHrefs.get(favicon);
            if (original) {
                favicon.href = original;
            }
        });
    }, [status]);
};
