'use client';

import React from 'react';
import styles from './result-card.module.css';

interface ResultStatProps {
  label: string;
  value: string;
}

const ResultStat: React.FC<ResultStatProps> = ({ label, value }) => {
  return (
    <div className={styles.statItem}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
};

export default ResultStat;
