# MFA Quick Start Guide

## ?? Get Started in 5 Minutes

### Step 1: Get Spryng API Credentials

1. Visit [https://www.spryngsms.com](https://www.spryngsms.com)
2. Sign up for an account
3. Navigate to API settings
4. Copy your API Token

### Step 2: Configure Application

Edit `appsettings.json`:

```json
{
  "AppSettings": {
    "SpryngApiToken": "PASTE_YOUR_TOKEN_HERE",
    "SpryngSender": "ScheduleMe"
  }
}
```

### Step 3: Update Database

```bash
dotnet ef database update
```

### Step 4: Test It!

#### 4.1 Enable MFA for a User

First, login with regular authentication to get a JWT token, then:

```bash
POST http://localhost:5000/accounts/{userId}/enable-mfa
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "phoneNumber": "+31612345678"
}
```

Replace:
- `{userId}` with the actual user ID
- `YOUR_JWT_TOKEN` with your JWT token
- `+31612345678` with your actual phone number

#### 4.2 Login with MFA

**Step 1 - Authenticate:**
```bash
POST http://localhost:5000/accounts/authenticate-mfa
Content-Type: application/json

{
  "email": "your@email.com",
  "password": "yourpassword",
  "dob": "01/01/1990"
}
```

**Response:**
```json
{
  "mfaRequired": true,
  "message": "Verification code sent to your registered phone number",
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Step 2 - Check Your Phone:**
You'll receive an SMS like:
```
Your verification code is: 123456. Valid for 10 minutes.
```

**Step 3 - Verify Code:**
```bash
POST http://localhost:5000/accounts/verify-mfa
Content-Type: application/json

{
  "email": "your@email.com",
  "mfaCode": "123456"
}
```

**Response:**
```json
{
  "id": "user-id",
  "email": "your@email.com",
  "firstName": "John",
  "lastName": "Doe",
  "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "..."
}
```

## ?? Complete Flow Diagram

```
User Login Flow with MFA:

1. User enters credentials
   ?
2. POST /accounts/authenticate-mfa
   ?
3. Backend checks if MFA enabled
   ?? No  ? Return JWT tokens (done)
   ?? Yes ? Generate 6-digit code
             ?
          4. Send SMS via Spryng
             ?
          5. Return { mfaRequired: true, tempToken }
             ?
          6. User receives SMS code
             ?
          7. User enters code
             ?
          8. POST /accounts/verify-mfa
             ?
          9. Validate code
             ?? Invalid ? Return error
             ?? Valid   ? Return JWT tokens (done)
```

## ?? Testing with Postman

### Collection Setup

Create a Postman collection with these requests:

**1. Login (Regular)**
- Method: POST
- URL: `http://localhost:5000/accounts/authenticate`
- Body (JSON):
```json
{
  "email": "user@example.com",
  "password": "password123",
  "dob": "01/01/1990"
}
```

**2. Enable MFA**
- Method: POST
- URL: `http://localhost:5000/accounts/{{userId}}/enable-mfa`
- Headers: `Authorization: Bearer {{jwtToken}}`
- Body (JSON):
```json
{
  "phoneNumber": "+31612345678"
}
```

**3. Login with MFA - Step 1**
- Method: POST
- URL: `http://localhost:5000/accounts/authenticate-mfa`
- Body (JSON):
```json
{
  "email": "user@example.com",
  "password": "password123",
  "dob": "01/01/1990"
}
```

**4. Login with MFA - Step 2**
- Method: POST
- URL: `http://localhost:5000/accounts/verify-mfa`
- Body (JSON):
```json
{
  "email": "user@example.com",
  "mfaCode": "123456"
}
```

**5. Check MFA Status**
- Method: GET
- URL: `http://localhost:5000/accounts/{{userId}}/mfa-status`
- Headers: `Authorization: Bearer {{jwtToken}}`

**6. Disable MFA**
- Method: POST
- URL: `http://localhost:5000/accounts/{{userId}}/disable-mfa`
- Headers: `Authorization: Bearer {{jwtToken}}`

## ?? Common Issues & Solutions

### Issue 1: SMS Not Received

**Check:**
1. Is the phone number in international format? (+CountryCode...)
2. Is your Spryng API token correct?
3. Do you have credits in your Spryng account?
4. Check application logs for errors

**Solution:**
```bash
# Check logs
tail -f logs/application.log

# Look for lines like:
# ERROR - Failed to send SMS to +31612345678. Status: 401
```

### Issue 2: "Invalid Code" Error

**Possible Causes:**
- Code expired (>10 minutes old)
- Too many attempts (>3)
- Code already used
- Wrong code entered

**Solution:**
Request a new code by logging in again.

### Issue 3: Build Errors

```bash
# Clean and rebuild
dotnet clean
dotnet build

# If Entity Framework errors:
dotnet ef migrations remove
dotnet ef migrations add AddMfaSupport
dotnet ef database update
```

### Issue 4: Service Registration Error

**Error:** `Unable to resolve service for type 'ISpryngSmsService'`

**Solution:** Check `Startup.cs` has:
```csharp
services.AddScoped<ISpryngSmsService, SpryngSmsService>();
services.AddScoped<IMfaService, MfaService>();
```

## ?? Monitoring & Logs

Key log messages to watch:

```
INFO  - MFA code generated for user user-id
INFO  - SMS sent successfully to +31612345678
INFO  - MFA code sent to user user@example.com
INFO  - MFA verification successful for user user@example.com
WARN  - Invalid MFA code for user user@example.com
ERROR - Failed to send SMS to +31612345678. Status: 401
```

## ?? Frontend Integration

### React Example

```jsx
const [showMfaInput, setShowMfaInput] = useState(false);
const [mfaCode, setMfaCode] = useState('');
const [email, setEmail] = useState('');

const handleLogin = async (email, password, dob) => {
  const response = await fetch('/accounts/authenticate-mfa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, dob })
  });
  
  const data = await response.json();
  
  if (data.mfaRequired) {
    setShowMfaInput(true);
    setEmail(email);
  } else {
    // Login successful, redirect
    localStorage.setItem('token', data.jwtToken);
    navigate('/dashboard');
  }
};

const handleMfaVerify = async () => {
  const response = await fetch('/accounts/verify-mfa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, mfaCode })
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.jwtToken);
  navigate('/dashboard');
};
```

### Vue Example

```vue
<template>
  <div v-if="!showMfaInput">
    <!-- Login form -->
  </div>
  <div v-else>
    <input v-model="mfaCode" placeholder="Enter 6-digit code" />
    <button @click="verifyMfa">Verify</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showMfaInput: false,
      mfaCode: '',
      email: ''
    }
  },
  methods: {
    async login(email, password, dob) {
      const response = await axios.post('/accounts/authenticate-mfa', {
        email, password, dob
      });
      
      if (response.data.mfaRequired) {
        this.showMfaInput = true;
        this.email = email;
      } else {
        localStorage.setItem('token', response.data.jwtToken);
        this.$router.push('/dashboard');
      }
    },
    async verifyMfa() {
      const response = await axios.post('/accounts/verify-mfa', {
        email: this.email,
        mfaCode: this.mfaCode
      });
      
      localStorage.setItem('token', response.data.jwtToken);
      this.$router.push('/dashboard');
    }
  }
}
</script>
```

## ?? Security Best Practices

1. **Always use HTTPS in production**
2. **Store API keys in environment variables**
3. **Implement rate limiting** on SMS endpoints
4. **Monitor for suspicious activity**
5. **Backup authentication methods**
6. **Regular security audits**

## ?? Next Steps

- [ ] Test with real phone number
- [ ] Set up production Spryng account
- [ ] Configure environment variables
- [ ] Implement rate limiting
- [ ] Add backup codes
- [ ] Set up monitoring alerts
- [ ] Update frontend application
- [ ] User documentation
- [ ] Security audit

## ?? Tips

1. **Test Mode:** Spryng offers a test mode - check their documentation
2. **International Numbers:** Always use international format (+CountryCode)
3. **Cost Control:** Set up Spryng spending limits
4. **User Experience:** Show estimated SMS delivery time
5. **Accessibility:** Provide alternative authentication methods

## ?? Need Help?

1. Check `MFA_IMPLEMENTATION_GUIDE.md` for detailed docs
2. Review logs in your log4net output
3. Test endpoints with Postman first
4. Verify Spryng API credentials
5. Check database migration status

---

**Ready to go? Start with Step 1!** ??
