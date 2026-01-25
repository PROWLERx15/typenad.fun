# TypeNad Deployment Security Checklist

## 🚨 CRITICAL - DO NOT DEPLOY WITHOUT COMPLETING

---

## 1. Private Key Management

### ⚠️ IMMEDIATE ACTION REQUIRED

- [ ] **Generate new private keys** for all accounts
  - [ ] New VERIFIER_PRIVATE_KEY
  - [ ] New DEPLOYER_PRIVATE_KEY
  - [ ] Document new addresses

- [ ] **Update smart contract** with new verifier address
  ```solidity
  contract.setVerifier(newVerifierAddress);
  ```

- [ ] **Store keys securely**
  - [ ] Add to Vercel Environment Variables (Production)
  - [ ] Or use AWS Secrets Manager
  - [ ] Or use HashiCorp Vault
  - [ ] **NEVER** commit to git

- [ ] **Remove from repository**
  - [ ] Delete `.env.local` from git history
  - [ ] Verify `.gitignore` includes `.env.local`
  - [ ] Audit git history for exposed keys

- [ ] **Rotate Supabase keys**
  - [ ] Generate new SERVICE_ROLE_KEY
  - [ ] Update in deployment platform

---

## 2. Database Security

### Row Level Security (RLS)

- [ ] **Update RLS policies** in `database.sql`
  ```sql
  -- Replace open policies with restrictive ones
  DROP POLICY "Allow public read/write users" ON public.users;
  
  CREATE POLICY "Users can read own data"
  ON public.users FOR SELECT
  USING (wallet_address = current_setting('request.jwt.claims')::json->>'wallet_address');
  
  CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  USING (wallet_address = current_setting('request.jwt.claims')::json->>'wallet_address');
  ```

- [ ] **Apply to all tables**
  - [ ] users
  - [ ] game_scores
  - [ ] user_inventory
  - [ ] user_achievements
  - [ ] duel_matches
  - [ ] duel_results

- [ ] **Test RLS policies** with different user accounts

### Database Backups

- [ ] **Enable automated backups** in Supabase
- [ ] **Test restore procedure**
- [ ] **Document backup retention policy**

---

## 3. API Security

### Rate Limiting

- [ ] **Install rate limiting package**
  ```bash
  npm install @upstash/ratelimit @upstash/redis
  ```

- [ ] **Create rate limit middleware**
  ```typescript
  // middleware.ts
  import { Ratelimit } from '@upstash/ratelimit';
  import { Redis } from '@upstash/redis';

  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(100, '15 m'),
  });
  ```

- [ ] **Apply to all API routes**
  - [ ] /api/score/*
  - [ ] /api/shop/*
  - [ ] /api/user/*
  - [ ] /api/achievements/*
  - [ ] /api/duel/*
  - [ ] /api/settle-game
  - [ ] /api/leaderboard

### Input Validation

- [ ] **Verify all validation is in place**
  - [x] Bonus amount validation (✅ Fixed)
  - [x] Wallet address validation (✅ Fixed)
  - [ ] Score validation (reasonable limits)
  - [ ] WPM validation (reasonable limits)
  - [ ] Stake amount validation

---

## 4. Environment Configuration

### Required Environment Variables

- [ ] **Set in production environment**
  ```bash
  # App
  NEXT_PUBLIC_APP_URL=https://your-production-domain.com
  NODE_ENV=production
  NEXT_PUBLIC_APP_VERSION=1.0.0
  
  # Network
  NEXT_PUBLIC_CHAIN_ID=10143
  NEXT_PUBLIC_MONAD_RPC_TESTNET=your_rpc_url
  
  # Contracts
  NEXT_PUBLIC_TYPE_NAD_CONTRACT_ADDRESS=0x...
  NEXT_PUBLIC_USDC_ADDRESS=0x...
  
  # Secrets (use secret management)
  VERIFIER_PRIVATE_KEY=...
  SUPABASE_SERVICE_ROLE_KEY=...
  ```

- [ ] **Verify all variables are set**
  ```bash
  vercel env pull .env.production
  # Check all required vars are present
  ```

---

## 5. Smart Contract Security

### Contract Verification

- [ ] **Verify contract on block explorer**
- [ ] **Audit contract code** for vulnerabilities
- [ ] **Test all contract functions** on testnet
- [ ] **Verify verifier address** matches deployed key

### Contract Limits

- [ ] **Set reasonable limits**
  - [ ] Maximum stake amount
  - [ ] Maximum bonus amount (✅ Fixed: 1 USDC)
  - [ ] Minimum stake amount
  - [ ] Platform fee percentage

---

## 6. Monitoring & Alerting

### Application Monitoring

- [ ] **Set up error tracking** (Sentry, LogRocket)
  ```bash
  npm install @sentry/nextjs
  ```

- [ ] **Configure alerts** for:
  - [ ] High error rates (>5% of requests)
  - [ ] Failed settlements
  - [ ] Database connection errors
  - [ ] Contract interaction failures

### Security Monitoring

- [ ] **Monitor for suspicious activity**
  - [ ] Unusual gold transactions
  - [ ] Multiple failed authentication attempts
  - [ ] Abnormal achievement unlock patterns
  - [ ] High-value stake games

- [ ] **Set up log aggregation** (Datadog, CloudWatch)

---

## 7. Testing

### Pre-Deployment Tests

- [ ] **Run all unit tests**
  ```bash
  npm test
  ```

- [ ] **Run integration tests**
  - [ ] Game flow (start → play → settle)
  - [ ] Shop purchase flow
  - [ ] Achievement unlock flow
  - [ ] Duel flow

- [ ] **Run E2E tests**
  - [ ] Full game session with real wallet
  - [ ] Multiplayer duel
  - [ ] Shop purchase with real transactions

### Security Tests

- [ ] **Test race conditions**
  - [ ] Concurrent shop purchases
  - [ ] Concurrent achievement unlocks
  - [ ] Concurrent duel settlements

- [ ] **Test input validation**
  - [ ] Invalid bonus amounts
  - [ ] Invalid wallet addresses
  - [ ] Negative values
  - [ ] Extremely large values

- [ ] **Test authentication**
  - [ ] Unauthorized API access
  - [ ] Token expiration
  - [ ] Invalid signatures

---

## 8. Performance

### Optimization

- [ ] **Enable caching** where appropriate
  - [x] Shop items (✅ Already implemented)
  - [ ] Leaderboard (✅ Already implemented)
  - [ ] User stats (✅ Already implemented)

- [ ] **Optimize database queries**
  - [ ] Add indexes for common queries
  - [ ] Use database aggregation instead of application-level

- [ ] **Enable CDN** for static assets

### Load Testing

- [ ] **Test under load**
  - [ ] 100 concurrent users
  - [ ] 1000 concurrent users
  - [ ] Peak load scenarios

---

## 9. Documentation

### Required Documentation

- [ ] **API documentation** (OpenAPI/Swagger)
- [ ] **Deployment guide**
- [ ] **Incident response procedures**
- [ ] **Rollback procedures**
- [ ] **Database schema documentation**

### User Documentation

- [ ] **How to play guide**
- [ ] **Wallet connection guide**
- [ ] **FAQ**
- [ ] **Terms of service**
- [ ] **Privacy policy**

---

## 10. Legal & Compliance

### Required Legal Documents

- [ ] **Terms of Service**
- [ ] **Privacy Policy**
- [ ] **Cookie Policy** (if applicable)
- [ ] **Gambling/Gaming regulations** compliance check

### Data Protection

- [ ] **GDPR compliance** (if serving EU users)
  - [ ] Data deletion procedures
  - [ ] Data export procedures
  - [ ] Cookie consent

- [ ] **User data encryption**
  - [ ] At rest
  - [ ] In transit

---

## 11. Incident Response

### Preparation

- [ ] **Create incident response plan**
  - [ ] Contact list
  - [ ] Escalation procedures
  - [ ] Communication templates

- [ ] **Set up emergency procedures**
  - [ ] Contract pause mechanism
  - [ ] Database rollback procedures
  - [ ] User notification system

### Monitoring

- [ ] **24/7 monitoring** for critical issues
- [ ] **On-call rotation** schedule
- [ ] **Incident tracking** system

---

## 12. Final Checks

### Pre-Launch

- [ ] **Code review** by security expert
- [ ] **Penetration testing** by third party
- [ ] **Load testing** completed
- [ ] **Backup and recovery** tested
- [ ] **Monitoring and alerts** configured

### Launch Day

- [ ] **Gradual rollout** (10% → 50% → 100%)
- [ ] **Monitor error rates** closely
- [ ] **Have rollback plan** ready
- [ ] **Team on standby** for issues

### Post-Launch

- [ ] **Monitor for 24 hours** continuously
- [ ] **Review logs** for anomalies
- [ ] **Collect user feedback**
- [ ] **Schedule post-mortem** meeting

---

## 🚨 EMERGENCY CONTACTS

```
Security Lead: [Name] - [Email] - [Phone]
DevOps Lead: [Name] - [Email] - [Phone]
Database Admin: [Name] - [Email] - [Phone]
Smart Contract Dev: [Name] - [Email] - [Phone]
```

---

## 📋 SIGN-OFF

Before deploying to production, the following must sign off:

- [ ] **Security Lead**: _________________ Date: _______
- [ ] **Tech Lead**: _________________ Date: _______
- [ ] **DevOps Lead**: _________________ Date: _______
- [ ] **Product Owner**: _________________ Date: _______

---

*Last Updated: January 25, 2026*
*Version: 1.0*
