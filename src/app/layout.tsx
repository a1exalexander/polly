import { CSPostHogProvider } from '@/app/providers';
import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/montserrat';
import './globals.css';

export const metadata: Metadata = {
    title: 'Polly',
    description: 'Real-Time Task Estimation and Voting Platform',
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
                <div className="layout">
                    {children}
                </div>
            </body>
        </CSPostHogProvider>
        </html>
    );
}
