'use client';

import React from 'react';
import { BUTTON_STYLES, SCREEN_STYLES, mergeStyles } from '../../styles/theme';
import { usePrivyWallet } from '../../hooks/usePrivyWallet';

const DEFAULT_WORDS = [
    'linera', 'microchains', 'cross-chain', 'faucet', 'bytecode', 'quorum', 'epoch', 'account', 'validator', 'webassembly',
    'single-owner', 'blockchain', 'wallet', 'mining', 'token', 'ledger', 'hash', 'smart contract',
    'decentralized', 'crypto', 'exchange', 'staking', 'gas', 'nft', 'defi', 'hodl',
    'whale', 'airdrop', 'fork', 'dapp', 'metaverse', 'dao', 'stablecoin', 'yield', 'liquidity', 'protocol',
    'scalability', 'consensus', 'validator', 'sharding', 'proof', 'stake', 'work', 'burn', 'satoshi', 'halving',
    'monad', 'transaction', 'block', 'chain', 'node', 'miner', 'reward', 'fees'
];

const WordsAdmin: React.FC = () => {
    const { address } = usePrivyWallet();
    const [wordsText, setWordsText] = React.useState(DEFAULT_WORDS.join('\n'));
    const [statusMessage, setStatusMessage] = React.useState('');

    const handleUpdate = async () => {
        const words = wordsText
            .split('\n')
            .map(w => w.trim())
            .filter(w => w.length > 0);

        if (words.length === 0) {
            setStatusMessage('❌ Please enter at least one word');
            return;
        }

        // Store words in localStorage for now (will be connected to Monad later)
        localStorage.setItem('game_words', JSON.stringify(words));
        setStatusMessage(`✅ Saved ${words.length} words locally!`);
        setTimeout(() => setStatusMessage(''), 3000);
    };

    const handleLoadDefaults = () => {
        setWordsText(DEFAULT_WORDS.join('\n'));
        setStatusMessage('📝 Loaded default words (not saved yet)');
        setTimeout(() => setStatusMessage(''), 3000);
    };

    return (
        <div style={mergeStyles(
            SCREEN_STYLES.fullScreen,
            SCREEN_STYLES.centered,
            SCREEN_STYLES.backgroundCover,
            {
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
                zIndex: 1002,
                padding: '40px',
            }
        )}>
            <div style={{
                background: 'rgba(0,0,0,0.8)',
                padding: '30px',
                borderRadius: '15px',
                border: '2px solid #8B5CF6',
                maxWidth: '600px',
                width: '100%',
            }}>
                <h1 style={{
                    color: '#8B5CF6',
                    textAlign: 'center',
                    marginBottom: '20px',
                }}>
                    🔐 Words Admin Panel
                </h1>

                <div style={{
                    background: 'rgba(139, 92, 246, 0.2)',
                    padding: '10px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    textAlign: 'center',
                    color: '#fff',
                }}>
                    Managing local word library for the game
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <label style={{ color: '#fff' }}>Words (one per line):</label>
                        <button onClick={handleLoadDefaults} style={BUTTON_STYLES.small}>
                            Load Defaults
                        </button>
                    </div>
                    <textarea
                        value={wordsText}
                        onChange={e => setWordsText(e.target.value)}
                        placeholder="Enter words, one per line..."
                        rows={15}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #8B5CF6',
                            background: 'rgba(0,0,0,0.5)',
                            color: '#fff',
                            fontFamily: 'monospace',
                            resize: 'vertical',
                        }}
                    />
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '5px' }}>
                        Current: {wordsText.split('\n').filter(w => w.trim()).length} words
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={handleUpdate}
                        style={mergeStyles(BUTTON_STYLES.medium, {
                            flex: 1,
                            background: '#8B5CF6',
                            color: 'white',
                        })}
                    >
                        Save Words
                    </button>
                </div>

                {statusMessage && (
                    <div style={{
                        marginTop: '15px',
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'rgba(139, 92, 246, 0.3)',
                        textAlign: 'center',
                        color: '#fff',
                    }}>
                        {statusMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WordsAdmin;
