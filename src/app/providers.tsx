'use client';

import { initPostHog } from '@/utils/posthog';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { PropsWithChildren } from 'react';
import PostHogPageView from './PostHogPageView';

initPostHog();

export function CSPostHogProvider({ children }: PropsWithChildren) {
    return (
        <PostHogProvider client={posthog}>
            <PostHogPageView />
            {children}
        </PostHogProvider>
    );
}
