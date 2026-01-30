import posthog, {PostHog} from 'posthog-js';

let posthogClient: PostHog;

export function initPostHog() {
    if (typeof window !== 'undefined' && !posthogClient) {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
            person_profiles: 'identified_only',
            capture_pageview: true,
            capture_pageleave: true,
            // Disable the PostHog toolbar to prevent KEA store errors
            // The toolbar is meant for PostHog's own UI and includes navigation-3000 components
            // that require KEA state management which is not available in external apps
            opt_in_site_apps: false,
        });

        posthogClient = posthog;
    }
}

export function getPostHogClient() {
    return posthogClient;
}
