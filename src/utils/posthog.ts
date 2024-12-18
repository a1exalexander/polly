import posthog, {PostHog} from 'posthog-js';

let posthogClient: PostHog;

export function initPostHog() {
    if (typeof window !== 'undefined' && !posthogClient) {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
            person_profiles: 'identified_only',
            capture_pageview: false,
            capture_pageleave: true,
        });

        posthogClient = posthog;
    }
}

export function getPostHogClient() {
    return posthogClient;
}
