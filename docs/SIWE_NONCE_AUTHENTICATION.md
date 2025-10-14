# SIWE Nonce Authentication Implementation

## Overview

This document describes the implementation of dynamic nonce-based authentication for Sign-In with Ethereum (SIWE) to prevent replay attacks.

## What is SIWE?

Sign-In with Ethereum (SIWE) is an authentication standard that allows users to authenticate with applications using their Ethereum wallet. Users sign a standardized message with their private key, proving ownership of their wallet address.

## The Problem: Replay Attacks

Without nonce protection, a malicious actor could:
1. Capture a user's signed SIWE message
2. Reuse that signature to authenticate as the user
3. Perform unauthorized actions on behalf of the user

## The Solution: Dynamic Nonces

Each authentication request includes a unique nonce that:
- Starts at `1` for new users
- Increments after each successful authentication
- Is unique per wallet address
- Prevents signature reuse

## Implementation Details

### Database Schema

```sql
-- Migration: 003_add_nonces.sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_nonce BIGINT NOT NULL DEFAULT 1;
```

### API Endpoints

#### Get Nonce
```
GET /auth/nonce/:wallet_address
```

Returns the current nonce for a wallet address:
```json
{
  "nonce": 1,
  "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
}
```

### Authentication Flow

1. **Frontend requests nonce** from `/auth/nonce/:address`
2. **Backend returns current nonce** (starts at 1 for new users)
3. **Frontend generates SIWE message**:
   ```
   Sign this message to authenticate with The Guild.

   Nonce: 1
   ```
4. **User signs message** with MetaMask
5. **Frontend sends signature** to protected endpoint
6. **Backend verifies signature** against reconstructed message
7. **Backend increments nonce** for next authentication

### Security Benefits

- **Replay Attack Prevention**: Each nonce can only be used once
- **User Isolation**: Each wallet has independent nonce sequence
- **Fresh Authentication**: No cached nonces - always current
- **Cryptographic Security**: Uses ethers.js for proper signature verification

### Code Structure

#### Backend
- `src/domain/repositories/profile_repository.rs` - Repository interface
- `src/infrastructure/repositories/postgres_profile_repository.rs` - PostgreSQL implementation
- `src/application/queries/get_login_nonce.rs` - Application query
- `src/presentation/handlers.rs` - API handler
- `src/infrastructure/services/ethereum_address_verification_service.rs` - Signature verification

#### Frontend
- `src/hooks/profiles/use-get-nonce.ts` - Nonce fetching hook
- `src/lib/utils/siwe.ts` - SIWE message generation
- `src/components/profiles/action-buttons/` - Updated UI components

### Usage Examples

#### Creating a Profile
```typescript
// 1. Fetch nonce
const { data: nonceData } = useGetNonce(walletAddress);

// 2. Generate SIWE message
const message = generateSiweMessage(nonceData.nonce);

// 3. Sign with wallet
const signature = await signMessageAsync({ message });

// 4. Create profile
await createProfile.mutateAsync({
  input: { name: "John Doe", description: "Developer" },
  signature
});
```

#### Backend Verification
```rust
// Reconstruct expected message
let expected_message = format!(
    "Sign this message to authenticate with The Guild.\n\nNonce: {}",
    nonce
);

// Verify signature
let recovered_address = signature.recover(expected_message)?;

// Increment nonce after successful verification
profile_repository.increment_login_nonce(&wallet_address).await?;
```

### Testing

#### Manual Testing
1. Start backend: `cargo run --bin guild-backend`
2. Start frontend: `npm run dev`
3. Connect MetaMask wallet
4. Create profile → nonce `1`
5. Update profile → nonce `2`
6. Delete profile → nonce `3`

#### Automated Testing
```bash
# Backend tests
cargo test

# Frontend tests
npm test
```

### Deployment Checklist

- [ ] Database migration applied
- [ ] SQLX cache updated (`cargo sqlx prepare`)
- [ ] Environment variables configured
- [ ] CORS settings updated for frontend domain
- [ ] Rate limiting configured (recommended)

### Security Considerations

- **Rate Limiting**: Implement rate limiting on nonce/auth endpoints
- **Monitoring**: Log authentication failures and nonce patterns
- **Database Constraints**: Consider adding nonce validation constraints
- **Audit**: Regular security audits of authentication flow

### Future Enhancements

- **Nonce Expiration**: Add time-based nonce expiration
- **Concurrent Request Handling**: Database-level atomic nonce operations
- **Advanced Monitoring**: Authentication metrics and alerts
- **Multi-device Support**: Handle multiple simultaneous sessions

## Conclusion

This implementation provides robust protection against replay attacks while maintaining a smooth user experience. The dynamic nonce system ensures that each authentication request is unique and cannot be reused, significantly improving the security of the SIWE authentication flow.

For questions or contributions, please refer to the implementation code or create an issue in the repository.