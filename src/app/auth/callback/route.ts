import { createClient } from '@/utils/supabase/server';
import { getUserName } from '@/utils/utils';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // The `/auth/callback` route is required for the server-side auth flow implemented
    // by the SSR package. It exchanges an auth code for the user's session.
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const origin = requestUrl.origin;
    const redirectTo = requestUrl.searchParams.get('redirect_to')?.toString();

    if (code) {
        const supabase = await createClient();
        await supabase.auth.exchangeCodeForSession(code);
        const { data: { user } } = await supabase.auth.getUser();

        if (user?.id) {
            const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
            const avatarUrl = (meta.avatar_url ?? meta.picture) as string | null | undefined;
            const baseRow = {
                user_id: user.id,
                name: getUserName(user),
                email: user.email,
            };
            // Try with avatar_url first. If the column doesn't exist yet (migration
            // not applied), retry without it so sign-in still works.
            const { error } = await supabase.from('Users')
                .upsert({ ...baseRow, avatar_url: avatarUrl ?? null }, { onConflict: 'user_id' });
            if (error && /avatar_url/i.test(error.message)) {
                await supabase.from('Users').upsert(baseRow, { onConflict: 'user_id' });
            }
        }
    }

    if (redirectTo) {
        return NextResponse.redirect(`${origin}${redirectTo}`);
    }

    // URL to redirect to after sign up process completes
    return NextResponse.redirect(`${origin}`);
}
