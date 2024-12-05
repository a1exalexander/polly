import { CSPostHogProvider } from '@/app/providers';
import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/montserrat';
import './globals.css';

export const metadata: Metadata = {
    title: 'Polly',
    description: 'A simple planning app',
};

export const viewport: Viewport = {
    themeColor: 'light',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <CSPostHogProvider>
            <body>
            {children}
            </body>
        </CSPostHogProvider>
        </html>
    );
}
