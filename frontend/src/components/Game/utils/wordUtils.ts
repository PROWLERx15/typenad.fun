const usedWords: string[] = [];
let wordLibrary: string[] = [];

// Initialize word library with provided words (fetched from Hub)
export const initializeWordLibrary = (words: string[]) => {
    if (words && words.length > 0) {
        // Filter out phrases with more than two words
        const filteredWords = words.filter((word) => word.split(' ').length <= 2);

        // Shuffle and pick up to 80 random words
        const shuffled = filteredWords.sort(() => Math.random() - 0.5);
        wordLibrary = shuffled.slice(0, Math.min(80, shuffled.length));
    } else {
        // Fallback to default words if none provided
        const defaultWords = [
            'linera', 'microchains', 'cross-chain', 'faucet', 'bytecode', 'quorum', 'epoch',
            'account', 'validator', 'webassembly', 'blockchain', 'wallet', 'mining', 'token',
            'ledger', 'hash', 'decentralized', 'crypto', 'exchange', 'staking', 'gas', 'nft',
            'defi', 'hodl', 'whale', 'airdrop', 'fork', 'dapp', 'dao', 'protocol'
        ];
        wordLibrary = defaultWords.sort(() => Math.random() - 0.5);
    }
};

export const generateUniqueWord = () => {
    let availableWords = wordLibrary.filter((word) => !usedWords.includes(word));

    // If no words available, reset and reuse all words
    if (availableWords.length === 0) {
        console.log('♻️ No words left, resetting word pool');
        usedWords.length = 0;
        availableWords = [...wordLibrary];
    }

    if (availableWords.length === 0) return null; // Still no words (empty library)

    const newWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    usedWords.push(newWord);
    return newWord;
};

export const resetUsedWords = () => {
    usedWords.length = 0; // Clear the array
};
