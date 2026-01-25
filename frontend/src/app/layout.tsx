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
    openGraph: {
        title: 'Typenad - Cosmic Typing Arena',
        description: 'A high-stakes cosmic typing game powered by Monad blockchain',
        images: ['https://www.typenad.app/images/monad-webpage-logo.jpeg'],
    },
    other: {
        // Farcaster Frame v2 (Canvas) metadata
        'fc:frame': 'vNext',
        'fc:frame:image': 'https://www.typenad.app/images/monad-webpage-logo.jpeg',
        'fc:frame:button:1': 'Play TypeNad',
        'fc:frame:button:1:action': 'launch_frame',
        'fc:frame:button:1:target': 'https://www.typenad.app',
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
