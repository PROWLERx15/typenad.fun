# Quick Start Guide - Duel Settlement Fix

## 🚀 Get Started in 3 Steps

### Step 1: Configure Environment

Add to your `.env.local` file:

```bash
# Backend verifier wallet (pays gas for settlements)
VERIFIER_PRIVATE_KEY=0x1234567890abcdef... # Your 64-char hex private key

# RPC endpoint (already configured, but verify)
NEXT_PUBLIC_MONAD_RPC_TESTNET=https://testnet-rpc.monad.xyz
```

**Get a Verifier Private Key:**
- Generate a new wallet OR use an existing one
- Export the private key (64 hex characters)
- **Important**: This wallet will pay gas fees for all settlements

### Step 2: Fund the Verifier Wallet

```bash
# 1. Get the verifier wallet address
# It will be logged when you start the server, or check the code

# 2. Send MON tokens to this address
# You need MON for gas fees on Monad testnet

# 3. Verify balance on Monad explorer
# https://testnet.monadexplorer.com/address/{verifier-address}
```

**Recommended Balance**: At least 10 MON to start (each settlement costs ~0.001-0.002 MON)

### Step 3: Start the Server

```bash
cd frontend
npm run dev
```

**Verify Setup:**
- Check console for: `✅ Environment variables validated successfully`
- No errors about missing VERIFIER_PRIVATE_KEY
- Server starts successfully

## ✅ Test It Works

### Quick Test (2 minutes)

1. **Open two browser windows**
   - Window 1: Connect with Account A
   - Window 2: Connect with Account B (use incognito mode)

2. **Create a duel** (Account A)
   - Click "Create Duel"
   - Set stake amount (e.g., 1 USDC)
   - Approve USDC transfer ✓
   - Approve transaction ✓

3. **Join the duel** (Account B)
   - Find the duel in the list
   - Click "Join Duel"
   - Approve USDC transfer ✓
   - Approve transaction ✓

4. **Play the game** (Both accounts)
   - Type the words for 60 seconds
   - Game ends automatically

5. **Watch the magic happen** ✨
   - Both players see "Submitting..."
   - First to finish sees "Waiting for Opponent..."
   - Second to finish triggers settlement
   - **CRITICAL CHECK**: ❌ NO WALLET APPROVAL POPUPS
   - Both see "Settlement in progress..."
   - Within 10 seconds: Winner announced!
   - Winner's USDC balance increases automatically

### What You Should See

✅ **During Game Start**: Wallet approvals (normal)
✅ **During Settlement**: NO wallet approvals (fixed!)
✅ **After Settlement**: Winner receives USDC automatically

### What You Should NOT See

❌ Wallet approval popup during settlement
❌ "Sign transaction" prompt after game ends
❌ Any player interaction needed to receive winnings

## 🔍 Verify It's Working

### Check the Logs

Look for these in your server console:

```
[Settlement] Starting attempt { duelId: "123", ... }
[Settlement] Winner determined { winner: "0x..." }
[Settlement] Transaction submitted { txHash: "0x..." }
[Settlement] Transaction confirmed { gasUsed: "150000" }
[Settlement] Completed successfully { payout: "1800000" }
```

### Check the Blockchain

1. Copy the transaction hash from the UI
2. Visit: `https://testnet.monadexplorer.com/tx/{txHash}`
3. Verify:
   - ✅ Status: Success
   - ✅ From: Verifier wallet address (not player!)
   - ✅ Function: settleDuel
   - ✅ Event: DuelSettled

## 🐛 Troubleshooting

### "VERIFIER_PRIVATE_KEY not configured"

**Fix**: Add the private key to `.env.local` and restart server

```bash
VERIFIER_PRIVATE_KEY=0x...
```

### "Insufficient funds for gas"

**Fix**: Send MON tokens to the verifier wallet

```bash
# Get verifier address from logs
# Send MON to that address
# Retry settlement
```

### Players still see wallet approval

**Fix**: Clear browser cache and hard refresh

```bash
# Chrome/Firefox: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
# Or clear cache in browser settings
```

### Settlement timeout

**Fix**: Check RPC endpoint and verifier wallet balance

```bash
# Test RPC endpoint
curl https://testnet-rpc.monad.xyz

# Check verifier wallet balance on explorer
```

## 📚 More Information

- **Full Documentation**: See `DUEL_SETTLEMENT.md`
- **Testing Guide**: See `TESTING_GUIDE.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`

## 🎯 Key Points to Remember

1. **Verifier wallet pays gas** - Keep it funded!
2. **No player approvals during settlement** - This is the fix!
3. **Settlement is automatic** - Happens when both players finish
4. **Monitor the logs** - They show everything happening
5. **Check the blockchain** - Verify transactions on explorer

## 🚨 Important Notes

### Security

- ⚠️ Never commit `.env.local` to git
- ⚠️ Keep VERIFIER_PRIVATE_KEY secret
- ⚠️ Use a dedicated wallet for verifier (not your main wallet)

### Monitoring

- 📊 Check verifier wallet balance regularly
- 📊 Monitor settlement success rate in logs
- 📊 Track gas costs per settlement

### Production

Before deploying to production:
1. Use a secure key management system
2. Set up monitoring and alerts
3. Test thoroughly on testnet
4. Start with small stakes
5. Monitor first settlements closely

## ✨ That's It!

You're now running the improved duel settlement system where players automatically receive their winnings without any wallet approvals. Enjoy the better UX!

**Questions?** Check the full documentation or review the implementation summary.
