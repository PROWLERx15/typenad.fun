# Solo Game Settlement - Quick Test Guide

## 🚀 Quick Test (2 minutes)

### **Prerequisites**
- ✅ Environment variables configured (`VERIFIER_PRIVATE_KEY`)
- ✅ Verifier wallet funded with MON tokens
- ✅ Server running (`npm run dev`)
- ✅ Test account with USDC for staking

### **Test Steps**

1. **Start a Solo Staked Game**
   - Connect your wallet
   - Click "Play Solo" or "Staked Game"
   - Set stake amount (e.g., 1 USDC)
   - Approve USDC transfer ✓
   - Approve transaction ✓

2. **Play the Game**
   - Type the words for 60 seconds
   - Try to get high WPM
   - Minimize misses and typos

3. **Watch the Magic Happen** ✨
   - Game ends automatically
   - See "Settlement in progress (no approval needed)..."
   - **CRITICAL CHECK**: ❌ NO WALLET APPROVAL POPUP
   - Within 5 seconds: Payout displayed!
   - Your USDC balance increases automatically

### **What You Should See**

✅ **During Game Start**: Wallet approvals (normal)
✅ **During Settlement**: NO wallet approvals (fixed!)
✅ **After Settlement**: Payout received automatically

### **What You Should NOT See**

❌ Wallet approval popup after game ends
❌ "Sign transaction" prompt during settlement
❌ Any player interaction needed to receive payout

## 🔍 Verify It's Working

### **Check the Logs**

Look for these in your server console:

```
[GameSettlement] Starting attempt { sequenceNumber: "123", ... }
[GameSettlement] Signature generated { signerAddress: "0x..." }
[GameSettlement] Transaction submitted { txHash: "0x..." }
[GameSettlement] Transaction confirmed { gasUsed: "120000" }
[GameSettlement] Completed successfully { payout: "1050000" }
```

### **Check the Blockchain**

1. Copy the transaction hash from the UI
2. Visit: `https://testnet.monadexplorer.com/tx/{txHash}`
3. Verify:
   - ✅ Status: Success
   - ✅ From: Verifier wallet address (not player!)
   - ✅ Function: settleGame
   - ✅ Event: GameSettled

### **Check Your Balance**

- Your USDC balance should increase by the payout amount
- Check in your wallet or on the explorer

## 💰 Payout Calculation

### **Formula**

```
Gross Payout = Stake + Bonus - Penalties
Platform Fee = Gross Payout × 10%
Net Payout = Gross Payout - Platform Fee
```

### **Components**

- **Stake**: Amount you wagered
- **Bonus**: WPM × 0.001 USDC (e.g., 50 WPM = 0.05 USDC)
- **Penalties**:
  - First 10 misses: FREE
  - Each miss after 10: -0.1 USDC
  - Each typo: -0.1 USDC
- **Platform Fee**: 10% of gross payout

### **Example Scenarios**

**Scenario 1: Good Performance**
- Stake: 1 USDC
- WPM: 60 → Bonus: 0.06 USDC
- Misses: 8 → Penalty: 0 USDC (under 10)
- Typos: 1 → Penalty: 0.1 USDC
- Gross: 1 + 0.06 - 0.1 = 0.96 USDC
- Fee: 0.096 USDC
- **Net Payout: 0.864 USDC** ✅ Profit!

**Scenario 2: Excellent Performance**
- Stake: 1 USDC
- WPM: 80 → Bonus: 0.08 USDC
- Misses: 5 → Penalty: 0 USDC
- Typos: 0 → Penalty: 0 USDC
- Gross: 1 + 0.08 = 1.08 USDC
- Fee: 0.108 USDC
- **Net Payout: 0.972 USDC** ✅ Good profit!

**Scenario 3: Poor Performance**
- Stake: 1 USDC
- WPM: 30 → Bonus: 0.03 USDC
- Misses: 20 → Penalty: 1.0 USDC (10 penalized)
- Typos: 5 → Penalty: 0.5 USDC
- Gross: 1 + 0.03 - 1.0 - 0.5 = -0.47 USDC (capped at 0)
- **Net Payout: 0 USDC** ❌ Lost stake

## 🐛 Troubleshooting

### **Issue: "VERIFIER_PRIVATE_KEY not configured"**

**Fix**: Add to `.env.local` and restart server
```bash
VERIFIER_PRIVATE_KEY=0x...
```

### **Issue: "Insufficient funds for gas"**

**Fix**: Send MON tokens to verifier wallet
```bash
# Get verifier address from logs
# Send MON to that address
```

### **Issue: Player still sees wallet approval**

**Fix**: Clear browser cache and hard refresh
```bash
# Chrome/Firefox: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### **Issue: Settlement timeout**

**Fix**: Check RPC endpoint and verifier wallet balance
```bash
# Test RPC
curl https://testnet-rpc.monad.xyz

# Check verifier balance on explorer
```

## 📊 Performance Expectations

### **Settlement Speed**
- **Target**: < 5 seconds
- **Typical**: 3-5 seconds
- **Maximum**: 10 seconds (with retries)

### **Gas Costs**
- **Typical**: 100,000-150,000 gas
- **Cost**: Depends on MON gas price
- **Paid by**: Verifier wallet (not player!)

### **Success Rate**
- **Target**: > 95%
- **Typical**: > 98%
- **Failures**: Usually temporary (network issues)

## ✅ Success Checklist

After testing, verify:

- [ ] Game starts successfully
- [ ] Game plays normally
- [ ] Game ends after 60 seconds
- [ ] **NO wallet approval popup during settlement**
- [ ] Settlement completes in < 5 seconds
- [ ] Payout amount is correct
- [ ] USDC balance increases
- [ ] Transaction visible on explorer
- [ ] Transaction sent from verifier wallet
- [ ] Logs show complete settlement flow

## 🎯 Key Points

1. **No Wallet Approvals**: Settlement happens automatically
2. **Verifier Pays Gas**: Player doesn't pay anything to receive payout
3. **Fast Settlement**: Typically 3-5 seconds
4. **Automatic Payout**: USDC sent directly to player
5. **Performance Matters**: Higher WPM = bigger bonus, fewer mistakes = less penalty

## 🚀 Ready to Test?

1. Make sure environment is configured
2. Fund verifier wallet with MON
3. Start the server
4. Play a solo staked game
5. Watch for NO wallet approval popup
6. Verify payout received automatically

**That's it!** The solo game settlement now works just like the duel settlement - seamlessly and automatically! 🎉
