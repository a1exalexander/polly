'use client';

import * as Sentry from "@sentry/browser";
import { createClient } from '@/utils/supabase/client';
import { getUserName } from '@/utils/utils';
import { usePathname, useSearchParams } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import { Suspense, useEffect } from 'react';

function PostHogPageView() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const posthog = usePostHog();

    useEffect(() => {
        if (pathname && posthog) {
            let url = window.origin + pathname;
            if (searchParams.toString()) {
                url = url + `?${searchParams.toString()}`;
            }

            posthog.capture('$pageview', { '$current_url': url });
        }
    }, [pathname, searchParams, posthog]);

    useEffect(() => {
        const supabase = createClient();

        const identifyUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                posthog.identify(user.id, { email: user.email, name: getUserName(user) });
                Sentry.setUser({ id: user.id, email: user.email, username: getUserName(user) });
            } else {
                Sentry.setUser(null);
            }
        };

        identifyUser();
    }, [posthog]);

    return null;
}

// Wrap this in Suspense to avoid the `useSearchParams` usage above
// from deopting the whole app into client-side rendering
// See https://nextjs.org/docs/messages/deopted-into-client-rendering
export default function SuspendedPostHogPageView() {
    return <Suspense fallback={null}>
        <PostHogPageView />
    </Suspense>;
}
