'use client';

import React from 'react';
import WordsAdmin from '../../../components/UI/WordsAdmin';
import { Analytics } from '@vercel/analytics/react';
import { Providers } from '../../providers';

export default function WordsAdminPage() {
    return (
        <Providers>
            <div>
                <Analytics />
                <WordsAdmin />
            </div>
        </Providers>
    );
}
