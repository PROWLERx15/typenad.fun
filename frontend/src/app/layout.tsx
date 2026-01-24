import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import '../styles/App.css';

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
});

export const metadata: Metadata = {
    title: 'Typenad - Cosmic Typing Arena',
    description: 'A high-stakes cosmic typing game powered by Monad blockchain',
    icons: {
        icon: '/images/monad-webpage-logo.jpeg',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className={jetbrainsMono.className} suppressHydrationWarning>{children}</body>
        </html>
    );
}
