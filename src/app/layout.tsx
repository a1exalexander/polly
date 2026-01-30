import { CSPostHogProvider } from '@/app/providers';
import { ThemeProvider, ThemeSwitch } from '@/components';
import { getThemeCookie } from '@/components/ThemeProvider';
import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/montserrat';
import './globals.css';

export const metadata: Metadata = {
    title: 'Polly',
    description: 'Real-Time Task Estimation and Voting Platform',
    icons: {
        icon: '/favicon.png',
    },
};

export const viewport: Viewport = {
    themeColor: 'light',
    colorScheme: 'light dark',
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const theme = await getThemeCookie();

    return (
        <html lang="en" data-theme={theme}>
        <CSPostHogProvider>
            <body>
            <ThemeProvider initialTheme={theme}>
                <div className="layout">
                    {children}
                    <div className="theme-switch-container">
                        <ThemeSwitch />
                    </div>
                </div>
            </ThemeProvider>
            </body>
        </CSPostHogProvider>
        </html>
    );
}
