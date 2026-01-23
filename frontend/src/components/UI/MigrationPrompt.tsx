'use client';

import React, { useState } from 'react';
import { migrateToSupabase, needsMigration } from '../../utils/dataMigration';
import { usePrivyWallet } from '../../hooks/usePrivyWallet';

interface MigrationPromptProps {
    onComplete: () => void;
}

const MigrationPrompt: React.FC<MigrationPromptProps> = ({ onComplete }) => {
    const { address } = usePrivyWallet();
    const [isOpen, setIsOpen] = useState(needsMigration());
    const [isMigrating, setIsMigrating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen || !address) return null;

    const handleMigrate = async () => {
        setIsMigrating(true);
        setError(null);

        const result = await migrateToSupabase(address);

        if (result.success) {
            setIsOpen(false);
            onComplete();
        } else {
            setError(result.error || 'Migration failed');
        }

        setIsMigrating(false);
    };

    const handleSkip = () => {
        localStorage.setItem('migration_skipped', 'true');
        setIsOpen(false);
        onComplete();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
        }}>
            <div style={{
                backgroundColor: '#1a1a1a',
                border: '2px solid #00FF88',
                borderRadius: '8px',
                padding: '40px',
                maxWidth: '500px',
                textAlign: 'center',
            }}>
                <h2 style={{
                    color: '#00FF88',
                    fontSize: '24px',
                    marginBottom: '20px',
                    fontFamily: '"Press Start 2P", monospace',
                }}>
                    Migrate Your Data
                </h2>
                
                <p style={{
                    color: '#fff',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    marginBottom: '30px',
                }}>
                    We detected local game data on this device. Would you like to sync it to the cloud?
                    This will preserve your progress, stats, and inventory across devices.
                </p>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(255, 68, 68, 0.2)',
                        border: '1px solid #FF4444',
                        borderRadius: '4px',
                        padding: '10px',
                        marginBottom: '20px',
                        color: '#FF4444',
                        fontSize: '12px',
                    }}>
                        {error}
                    </div>
                )}

                <div style={{
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'center',
                }}>
                    <button
                        onClick={handleMigrate}
                        disabled={isMigrating}
                        style={{
                            backgroundColor: '#00FF88',
                            color: '#000',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '12px 24px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: isMigrating ? 'not-allowed' : 'pointer',
                            opacity: isMigrating ? 0.6 : 1,
                        }}
                    >
                        {isMigrating ? 'Migrating...' : 'Sync to Cloud'}
                    </button>
                    
                    <button
                        onClick={handleSkip}
                        disabled={isMigrating}
                        style={{
                            backgroundColor: 'transparent',
                            color: '#888',
                            border: '1px solid #444',
                            borderRadius: '4px',
                            padding: '12px 24px',
                            fontSize: '14px',
                            cursor: isMigrating ? 'not-allowed' : 'pointer',
                        }}
                    >
                        Skip
                    </button>
                </div>

                <p style={{
                    color: '#666',
                    fontSize: '10px',
                    marginTop: '20px',
                }}>
                    Your local data will remain on this device even if you skip.
                </p>
            </div>
        </div>
    );
};

export default MigrationPrompt;
