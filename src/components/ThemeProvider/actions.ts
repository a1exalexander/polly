'use server';

import { cookies } from 'next/headers';
import { THEME_COOKIE_NAME, type Theme } from './constants';

export async function setThemeCookie(theme: Theme) {
    const cookieStore = await cookies();
    cookieStore.set(THEME_COOKIE_NAME, theme, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: 'lax',
    });
}

export async function getThemeCookie(): Promise<Theme> {
    const cookieStore = await cookies();
    const theme = cookieStore.get(THEME_COOKIE_NAME)?.value;
    return theme === 'dark' ? 'dark' : 'light';
}
