# MFA (Multi-Factor Authentication) Implementation Guide

## Overview

This implementation adds SMS-based Multi-Factor Authentication to your ASP.NET Core application using Spryng SMS service.

## Features

- ? SMS-based verification codes
- ? 6-digit numeric codes with 10-minute expiration
- ? Brute-force protection (3 attempts max)
- ? User-controlled MFA enable/disable
- ? Temporary JWT tokens for MFA flow
- ? Optional MFA per user
- ? Spryng SMS integration

## Configuration

### 1. Spryng API Setup

1. Create a Spryng account at [https://www.spryngsms.com](https://www.spryngsms.com)
2. Get your API token from the Spryng dashboard
3. Add the following to your `appsettings.json`:

```json
{
  "AppSettings": {
    ...
    "SpryngApiToken": "YOUR_SPRYNG_API_TOKEN_HERE",
    "SpryngSender": "ScheduleMe"
  }
}
```

### 2. Database Migration

Run the migration to add MFA support to the database:

```bash
dotnet ef database update
```

This adds the `MfaEnabled` field to the Account table.

## API Endpoints

### Authentication with MFA

#### 1. Authenticate with MFA Support
**POST** `/accounts/authenticate-mfa`

Request:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "dob": "01/01/1990"
}
```

Response (MFA Enabled):
```json
{
  "mfaRequired": true,
  "message": "Verification code sent to your registered phone number",
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Response (MFA Not Enabled):
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "..."
}
```

#### 2. Verify MFA Code
**POST** `/accounts/verify-mfa`

Request:
```json
{
  "email": "user@example.com",
  "mfaCode": "123456"
}
```

Response:
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "..."
}
```

### MFA Management

#### 3. Enable MFA
**POST** `/accounts/{userId}/enable-mfa`

Headers:
```
Authorization: Bearer {jwtToken}
```

Request:
```json
{
  "phoneNumber": "+31612345678"
}
```

Response:
```json
{
  "message": "MFA enabled successfully. You will receive SMS verification codes for future logins."
}
```

#### 4. Disable MFA
**POST** `/accounts/{userId}/disable-mfa`

Headers:
```
Authorization: Bearer {jwtToken}
```

Response:
```json
{
  "message": "MFA disabled successfully."
}
```

#### 5. Check MFA Status
**GET** `/accounts/{userId}/mfa-status`

Headers:
```
Authorization: Bearer {jwtToken}
```

Response:
```json
{
  "mfaEnabled": true
}
```

## Frontend Integration

### Login Flow with MFA

```typescript
// 1. Initial authentication
async function login(email: string, password: string, dob: string) {
  const response = await fetch('/accounts/authenticate-mfa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, dob })
  });
  
  const data = await response.json();
  
  if (data.mfaRequired) {
    // Show MFA verification form
    return { requiresMfa: true, tempToken: data.tempToken };
  } else {
    // Store tokens and redirect to app
    localStorage.setItem('jwtToken', data.jwtToken);
    return { requiresMfa: false };
  }
}

// 2. MFA verification
async function verifyMfaCode(email: string, code: string) {
  const response = await fetch('/accounts/verify-mfa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, mfaCode: code })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Store tokens and redirect to app
    localStorage.setItem('jwtToken', data.jwtToken);
    return { success: true };
  } else {
    return { success: false, error: data.message };
  }
}

// 3. Enable MFA
async function enableMfa(userId: string, phoneNumber: string) {
  const response = await fetch(`/accounts/${userId}/enable-mfa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
    },
    body: JSON.stringify({ phoneNumber })
  });
  
  return await response.json();
}

// 4. Disable MFA
async function disableMfa(userId: string) {
  const response = await fetch(`/accounts/${userId}/disable-mfa`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
    }
  });
  
  return await response.json();
}
```

## Architecture

### Services

1. **ISpryngSmsService / SpryngSmsService**
   - Handles SMS sending via Spryng REST API
   - Formats verification messages
   - Error handling and logging

2. **IMfaService / MfaService**
   - Generates 6-digit verification codes
   - Manages code lifecycle (generation, validation, expiration)
   - Brute-force protection
   - MFA enable/disable functionality

3. **IAccountService / AccountService**
   - `AuthenticateWithMfaAsync`: Initial authentication with MFA check
   - `VerifyMfaAsync`: Validates MFA code and issues tokens
   - `EnableMfaAsync`: Enables MFA for a user
   - `DisableMfaAsync`: Disables MFA for a user
   - `IsMfaEnabled`: Checks if MFA is enabled

### Models

1. **VerifyMfaRequest**
   - Email
   - MfaCode

2. **EnableMfaRequest**
   - PhoneNumber

3. **MfaResponse**
   - MfaRequired (bool)
   - Message (string)
   - TempToken (string)

### Database Changes

**Account Entity** - Added:
- `MfaEnabled` (bool): Indicates if MFA is enabled for the user
- `PhoneNumber` (string): Already exists in IdentityUser base class

## Security Considerations

### Code Generation
- Uses cryptographically secure random number generation
- 6-digit numeric codes (1 million combinations)
- 10-minute expiration window

### Brute-Force Protection
- Maximum 3 attempts per code
- Codes invalidated after expiration
- Codes invalidated after successful validation

### Token Security
- Temporary tokens issued during MFA flow (10-minute expiration)
- Regular JWT tokens issued after successful MFA (15-minute expiration)
- Refresh tokens for long-term sessions

### Phone Number Storage
- Phone numbers stored in Account.PhoneNumber (from IdentityUser)
- Format validation using [Phone] attribute
- Required when enabling MFA

## Testing

### Manual Testing

1. **Enable MFA for a user:**
   ```bash
   curl -X POST https://localhost:5000/accounts/{userId}/enable-mfa \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer {token}" \
     -d '{"phoneNumber": "+31612345678"}'
   ```

2. **Login with MFA:**
   ```bash
   # Step 1: Authenticate
   curl -X POST https://localhost:5000/accounts/authenticate-mfa \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "password": "password123",
       "dob": "01/01/1990"
     }'
   
   # Step 2: Verify code (check your phone for the SMS)
   curl -X POST https://localhost:5000/accounts/verify-mfa \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "mfaCode": "123456"
     }'
   ```

## Production Considerations

### 1. Caching
Currently, MFA codes are stored in-memory. For production with multiple servers, consider:
- Redis cache
- Distributed cache
- Database storage with cleanup jobs

### 2. SMS Costs
- Spryng charges per SMS
- Consider implementing:
  - Rate limiting (max X codes per user per day)
  - Cost alerts
  - Backup authentication methods

### 3. Phone Number Verification
Consider adding:
- Phone number verification during MFA setup
- Test SMS before enabling MFA
- Phone number update flow with verification

### 4. Monitoring
Add monitoring for:
- SMS delivery failures
- MFA verification failure rates
- Code expiration rates
- Brute-force attempts

### 5. Backup Authentication
Consider implementing backup methods:
- Backup codes (one-time use)
- Email-based verification
- Authenticator app (TOTP)

## Troubleshooting

### SMS Not Received
1. Check Spryng API token is correct
2. Verify phone number format (international format: +CountryCode...)
3. Check Spryng account balance
4. Review logs for API errors

### Invalid Code Errors
1. Check code hasn't expired (10-minute window)
2. Verify user hasn't exceeded 3 attempts
3. Ensure code hasn't been used already

### Migration Issues
If migration fails:
```bash
dotnet ef migrations remove
dotnet ef migrations add AddMfaSupport
dotnet ef database update
```

## Future Enhancements

1. **TOTP Support** - Add authenticator app support (Google Authenticator, Authy)
2. **Backup Codes** - Generate one-time backup codes
3. **Remember Device** - Skip MFA on trusted devices
4. **Admin MFA Enforcement** - Require MFA for certain roles
5. **SMS Templates** - Customize SMS message templates
6. **Multi-channel** - Support email and SMS as alternatives

## Support

For issues or questions:
1. Check logs in `log4net` output
2. Verify Spryng API credentials
3. Review database migration status
4. Test with Postman/curl before frontend integration
