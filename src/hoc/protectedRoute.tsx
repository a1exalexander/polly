import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { FC } from 'react';

export async function protectedRoute<T extends object>(Component: FC<T>) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/sign-in');
    }

    return async function ProtectedComponent(props: T) {
        return <Component {...props} />;
    };
}

export async function protectedRouteAsync<T extends object>(Component: FC<T>) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/sign-in');
    }

    return async function ProtectedComponent(props: T) {
        return <Component {...props} />;
    };
}
