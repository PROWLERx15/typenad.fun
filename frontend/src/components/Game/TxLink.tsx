'use client';

import React, { useState } from 'react';
import styles from './result-card.module.css';

interface TxLinkProps {
  txHash: string;
}

const TxLink: React.FC<TxLinkProps> = ({ txHash }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy transaction hash:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = txHash;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncatedHash = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
  const explorerUrl = `https://testnet.monadexplorer.com/tx/${txHash}`;

  return (
    <div className={styles.txLinkContainer}>
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.txLink}
        aria-label="View transaction on Monad Explorer"
      >
        <span className={styles.txHash}>{truncatedHash}</span>
        <span className={styles.externalIcon}>↗</span>
      </a>
      <button
        onClick={handleCopy}
        className={styles.txCopyButton}
        title="Copy transaction hash"
        aria-label="Copy transaction hash"
      >
        {copied ? '✓' : '📋'}
      </button>
      {copied && <span className={styles.copiedFeedback}>Copied!</span>}
    </div>
  );
};

export default TxLink;
