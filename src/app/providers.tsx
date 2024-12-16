'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { PropsWithChildren } from 'react';
import PostHogPageView from './PostHogPageView';

if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        person_profiles: 'identified_only',
        capture_pageview: false,
        capture_pageleave: true,
    });
}

export function CSPostHogProvider({ children }: PropsWithChildren) {
    return (
        <PostHogProvider client={posthog}>
            <PostHogPageView />
            {children}
        </PostHogProvider>
    );
}
