'use client';

import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { usePrivyWallet } from '../../hooks/usePrivyWallet';
import { SCREEN_STYLES, BACKGROUND_STYLES, BUTTON_STYLES, mergeStyles } from '../../styles/theme';
import { styles } from './ShopScreen.styles';
import {
    getPowerupInventory,
    addPowerupToInventory,
    getEquippedPowerups,
    setEquippedPowerups,
    STORAGE_KEYS
} from '../../constants/gameStats';
import { supabaseUntyped as supabase } from '../../lib/supabaseClient';
import { ensureUserExists } from '../../utils/supabaseHelpers';

interface ShopScreenProps {
    onClose: () => void;
    totalGold?: number;
    onPurchaseSuccess?: () => void;
    chainId?: string;
    onEquippedChange?: (equipped: string[]) => void;
}

interface ShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    icon: string;
    available: boolean;
}

const SHOP_ITEMS: ShopItem[] = [
    { id: 'double-gold', name: 'Double Credits', description: 'Earn 2x credits for one game', price: 100, icon: '/images/gold-coin.png', available: true },
    { id: 'triple-gold', name: 'Triple Credits', description: 'Earn 3x credits for one game', price: 200, icon: '/images/gold-coin.png', available: true },
    { id: 'double-points', name: 'Double Points', description: 'Double your score for one game', price: 100, icon: '/images/double-points.png', available: true },
    { id: 'triple-points', name: 'Triple Points', description: 'Triple your score for one game', price: 200, icon: '/images/triple-points.png', available: true },
    { id: 'extra-life', name: 'Extra Shield', description: 'Start with 4 shields instead of 3', price: 150, icon: '/images/heart.png', available: true },
    { id: 'slow-enemies', name: 'Slow Motion', description: 'Enemies move 50% slower', price: 200, icon: '/images/slow-enemies.png', available: true },
];

type TabType = 'shop' | 'inventory';

const ShopScreen: React.FC<ShopScreenProps> = ({ onClose, totalGold = 0, onPurchaseSuccess, chainId, onEquippedChange }) => {
    const { user } = usePrivy();
    const { address } = usePrivyWallet();
    const [activeTab, setActiveTab] = useState<TabType>('shop');
    const [inventory, setInventory] = useState<Record<string, number>>({});
    const [equipped, setEquipped] = useState<string[]>([]);
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [currentGold, setCurrentGold] = useState<number>(totalGold);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Initial load from local storage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setInventory(getPowerupInventory());
            setEquipped(getEquippedPowerups());
            const storedGold = localStorage.getItem(STORAGE_KEYS.PLAYER_GOLD);
            if (storedGold) setCurrentGold(parseInt(storedGold));
        }
    }, []);

    // Sync from Supabase
    useEffect(() => {
        const syncFromSupabase = async () => {
            if (!address) return;

            try {
                // 1. Get User Gold
                const { data: userData } = await supabase
                    .from('users')
                    .select('gold')
                    .eq('wallet_address', address)
                    .single();

                if (userData && userData.gold !== undefined) {
                    setCurrentGold(userData.gold);
                    localStorage.setItem(STORAGE_KEYS.PLAYER_GOLD, userData.gold.toString());
                }

                // 2. Get User Inventory
                const { data: userDataId } = await supabase
                    .from('users')
                    .select('id')
                    .eq('wallet_address', address)
                    .single();

                if (userDataId) {
                    const { data: inventoryData } = await supabase
                        .from('user_inventory')
                        .select('item_id, quantity')
                        .eq('user_id', userDataId.id);

                    if (inventoryData) {
                        const newInventory: Record<string, number> = {};
                        inventoryData.forEach((item: { item_id: string; quantity: number }) => {
                            newInventory[item.item_id] = item.quantity;
                        });
                        setInventory(newInventory);
                    }
                }
            } catch (err) {
                console.error('Failed to sync shop data from Supabase:', err);
            }
        };

        syncFromSupabase();
    }, [address]);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const showMessage = (text: string, type: 'success' | 'error') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 2000);
    };

    const handlePurchasePowerup = async (item: ShopItem) => {
        if (purchasing || currentGold < item.price) {
            if (currentGold < item.price) {
                showMessage('Not enough gold!', 'error');
            }
            return;
        }

        setPurchasing(item.id);

        try {
            // Optimistic update
            const newGold = currentGold - item.price;
            setCurrentGold(newGold);
            localStorage.setItem(STORAGE_KEYS.PLAYER_GOLD, newGold.toString());

            addPowerupToInventory(item.id, 1);
            const newInventory = getPowerupInventory();
            setInventory(newInventory);

            // Supabase update
            if (address) {
                // Get user data from Privy
                const email = user?.email?.address || user?.google?.email;
                const username = user?.google?.name ?? undefined;
                const googleId = user?.google?.subject;

                // 1. Get User ID
                const userId = await ensureUserExists(supabase, address, {
                    email: email ?? undefined,
                    username,
                    googleId
                });

                if (userId) {
                    // 2. Update Gold
                    await supabase
                        .from('users')
                        .update({ gold: newGold })
                        .eq('id', userId);

                    // 3. Update Inventory
                    const { data: existingItem } = await supabase
                        .from('user_inventory')
                        .select('quantity')
                        .eq('user_id', userId)
                        .eq('item_id', item.id)
                        .single();

                    if (existingItem) {
                        await supabase
                            .from('user_inventory')
                            .update({ quantity: existingItem.quantity + 1 })
                            .eq('user_id', userId)
                            .eq('item_id', item.id);
                    } else {
                        await supabase
                            .from('user_inventory')
                            .insert({
                                user_id: userId,
                                item_id: item.id,
                                quantity: 1
                            });
                    }
                }
            }

            showMessage(`Purchased ${item.name}!`, 'success');
            if (onPurchaseSuccess) onPurchaseSuccess();
        } catch (err) {
            console.error('Purchase failed:', err);
            showMessage('Purchase failed. Check console.', 'error');
            // Revert optimistic update (simplified)
            const storedGold = localStorage.getItem(STORAGE_KEYS.PLAYER_GOLD);
            if (storedGold) setCurrentGold(parseInt(storedGold));
        } finally {
            setPurchasing(null);
        }
    };

    const handleEquip = (powerupId: string) => {
        const inventoryCount = inventory[powerupId] || 0;
        if (inventoryCount <= 0) return;

        // Check if already at max equipped (3 powerups)
        if (equipped.length >= 3 && !equipped.includes(powerupId)) {
            showMessage('Max 3 powerups can be equipped!', 'error');
            return;
        }

        let newEquipped: string[];
        if (equipped.includes(powerupId)) {
            // Unequip
            newEquipped = equipped.filter(id => id !== powerupId);
            showMessage('Powerup unequipped', 'success');
        } else {
            // Equip
            newEquipped = [...equipped, powerupId];
            showMessage('Powerup equipped!', 'success');
        }

        setEquipped(newEquipped);
        setEquippedPowerups(newEquipped);
        if (onEquippedChange) onEquippedChange(newEquipped);
    };

    const getItemById = (id: string): ShopItem | undefined => {
        return SHOP_ITEMS.find(item => item.id === id);
    };

    const getTotalOwned = (powerupId: string): number => {
        return inventory[powerupId] || 0;
    };

    return (
        <div style={mergeStyles(
            SCREEN_STYLES.fullScreen,
            SCREEN_STYLES.centered,
            SCREEN_STYLES.backgroundCover,
            BACKGROUND_STYLES.startScreenBackground,
            styles.screenContainer
        )}>
            <button onClick={onClose} style={mergeStyles(BUTTON_STYLES.small, styles.closeButtonPosition)}>
                Close
            </button>

            <div style={styles.contentContainer}>
                <h1 style={styles.title}>Shop</h1>

                {/* Message Toast */}
                {message && (
                    <div style={{
                        position: 'fixed',
                        top: '100px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        background: message.type === 'success' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 68, 68, 0.2)',
                        border: message.type === 'success' ? '2px solid #00FF88' : '2px solid #FF4444',
                        color: message.type === 'success' ? '#00FF88' : '#FF4444',
                        fontFamily: '"Press Start 2P", monospace',
                        fontSize: '12px',
                        zIndex: 2000,
                    }}>
                        {message.text}
                    </div>
                )}

                {/* Tab Navigation */}
                <div style={styles.tabNav}>
                    <button
                        onClick={() => setActiveTab('shop')}
                        style={styles.tabButton(activeTab === 'shop')}
                    >
                        Buy Powerups
                    </button>
                    <button
                        onClick={() => setActiveTab('inventory')}
                        style={styles.tabButton(activeTab === 'inventory')}
                    >
                        Inventory ({Object.values(inventory).reduce((a, b) => a + b, 0)})
                    </button>
                </div>

                {/* Treasury Section */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Treasury</h2>
                    <div style={styles.goldDisplay}>
                        <img src="/images/gold-coin.png" alt="Gold" style={styles.goldIcon} />
                        <span style={styles.goldAmount}>{currentGold}</span>
                        <span style={styles.goldLabel}>Credits</span>
                    </div>
                </div>

                {/* Equipped Section */}
                {equipped.length > 0 && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>Equipped for Next Game ({equipped.length}/3)</h2>
                        <div style={styles.equippedGrid}>
                            {equipped.map((id) => {
                                const item = getItemById(id);
                                if (!item) return null;
                                return (
                                    <div key={id} style={styles.equippedItem}>
                                        <img src={item.icon} alt={item.name} style={styles.equippedIcon} />
                                        <span style={styles.equippedName}>{item.name}</span>
                                        <button
                                            onClick={() => handleEquip(id)}
                                            style={styles.unequipButton}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        <p style={styles.equippedNote}>Equipped powerups will be consumed when you start a game</p>
                    </div>
                )}

                {/* Shop Tab Content */}
                {activeTab === 'shop' && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>Power Ups</h2>
                        <div style={styles.itemsGrid}>
                            {SHOP_ITEMS.map((item) => {
                                const owned = getTotalOwned(item.id);
                                const canAfford = currentGold >= item.price;
                                const isPurchasing = purchasing === item.id;

                                return (
                                    <div key={item.id} style={styles.itemCard}>
                                        {owned > 0 && (
                                            <div style={styles.ownedBadge}>
                                                Owned: {owned}
                                            </div>
                                        )}
                                        <div style={styles.itemIcon}>
                                            <img src={item.icon} alt={item.name} style={styles.itemIconImage} />
                                        </div>
                                        <div style={styles.itemName}>{item.name}</div>
                                        <div style={styles.itemDescription}>{item.description}</div>
                                        <div style={styles.itemPrice}>
                                            <img src="/images/gold-coin.png" alt="Gold" style={styles.priceIcon} />
                                            <span>{item.price}</span>
                                        </div>
                                        <button
                                            style={mergeStyles(
                                                styles.buyButton,
                                                (!canAfford || isPurchasing) ? styles.buyButtonDisabled : {}
                                            )}
                                            disabled={!canAfford || isPurchasing}
                                            onClick={() => handlePurchasePowerup(item)}
                                        >
                                            {isPurchasing ? 'Buying...' : canAfford ? 'Buy' : 'Need More Gold'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Inventory Tab Content */}
                {activeTab === 'inventory' && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>Your Inventory</h2>
                        {Object.keys(inventory).length === 0 ? (
                            <div style={styles.emptyInventory}>
                                <p>No powerups yet!</p>
                                <p style={{ marginTop: '10px', opacity: 0.7 }}>Purchase powerups from the shop to use in battle.</p>
                            </div>
                        ) : (
                            <div style={styles.itemsGrid}>
                                {Object.entries(inventory).map(([powerupId, quantity]) => {
                                    const item = getItemById(powerupId);
                                    if (!item || quantity <= 0) return null;

                                    const isEquipped = equipped.includes(powerupId);

                                    return (
                                        <div key={powerupId} style={mergeStyles(
                                            styles.itemCard,
                                            isEquipped ? styles.itemCardEquipped : {}
                                        )}>
                                            <div style={styles.quantityBadge}>
                                                ×{quantity}
                                            </div>
                                            <div style={styles.itemIcon}>
                                                <img src={item.icon} alt={item.name} style={styles.itemIconImage} />
                                            </div>
                                            <div style={styles.itemName}>{item.name}</div>
                                            <div style={styles.itemDescription}>{item.description}</div>
                                            <button
                                                style={mergeStyles(
                                                    styles.equipButton,
                                                    isEquipped ? styles.equipButtonActive : {}
                                                )}
                                                onClick={() => handleEquip(powerupId)}
                                            >
                                                {isEquipped ? '✓ Equipped' : 'Equip'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Buy Gold Section */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Buy Credits</h2>
                    <div style={styles.comingSoonSubtitle}>Coming soon with Monad integration!</div>
                </div>
            </div>
        </div>
    );
};

export default ShopScreen;
