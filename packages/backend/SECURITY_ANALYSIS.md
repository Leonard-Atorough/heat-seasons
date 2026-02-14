# Security Analysis: Authentication System

## Executive Summary

The current authentication system uses Google OAuth 2.0 for third-party authentication with JWT tokens for session management. Several critical and medium-severity security vulnerabilities have been identified.

---

## 🔴 CRITICAL ISSUES

### 1. **JWT Secret Exposed in Code (Hardcoded Fallback)**

**Location:** [src/utils/jwt.ts](src/utils/jwt.ts#L3)

```typescript
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";
```

**Risk:** If `JWT_SECRET` environment variable is not set, the application falls back to a hardcoded secret. This could allow:

- Token forgery
- Unauthorized account access
- Complete authentication bypass

**Remediation:**

```typescript
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
```

---

### 2. **Sensitive Token Passed in URL Query Parameter**

**Location:** [src/api/auth/auth.controller.ts](src/api/auth/auth.controller.ts#L47)

```typescript
res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
```

**Risk:**

- Tokens in URLs are logged in browser history, server logs, and access logs
- HTTP Referrer headers expose tokens to third-party services
- Vulnerable to token interception via logging
- XSS attacks can easily steal tokens from URL

**Remediation:** Use secure HTTP-only cookies instead:

```typescript
res.cookie("authToken", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000,
});
res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
```

---

### 3. **No Token Blacklist / Logout Implementation**

**Location:** [src/api/auth/auth.service.ts](src/api/auth/auth.service.ts#L38-L42)

```typescript
async logout(token: string): Promise<void> {
  // For JWT, we can't truly "logout" on the server side without a token blacklist...
  return;
}
```

**Risk:**

- Logout is ineffective; tokens remain valid until expiration
- Users cannot be forcibly logged out
- Compromised tokens cannot be revoked
- Session hijacking is not recoverable

**Remediation:** Implement token blacklist:

```typescript
// In database or Redis
async logout(token: string): Promise<void> {
  const decoded = JwtService.verifyToken(token);
  if (decoded) {
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    await tokenBlacklistService.add(token, ttl);
  }
}

// Verify token is not blacklisted before processing
async verifyTokenNotBlacklisted(token: string): Promise<boolean> {
  return !await tokenBlacklistService.isBlacklisted(token);
}
```

---

### 4. **No Rate Limiting on Auth Endpoints**

**Location:** [src/api/auth/auth.route.ts](src/api/auth/auth.route.ts)

**Risk:**

- Brute force attacks on `/api/auth/me` (token guessing)
- OAuth callback could be exploited
- No protection against credential stuffing
- DDoS amplification possible

**Remediation:** Implement rate limiting:

```typescript
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests",
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Stricter limit for login
});

router.get("/google", loginLimiter, passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", loginLimiter, ...);
```

---

## 🟠 HIGH-SEVERITY ISSUES

### 5. **Insufficient Session Cookie Security**

**Location:** [src/index.ts](src/index.ts#L30-L39)

```typescript
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  }),
);
```

**Issues:**

1. Session secret has hardcoded fallback ("dev-secret")
2. `sameSite: "lax"` is too permissive; should be "strict"
3. No `maxAge` specified for session timeout

**Remediation:**

```typescript
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      domain: process.env.COOKIE_DOMAIN,
    },
  }),
);
```

---

### 6. **No CSRF Protection**

**Location:** [src/index.ts](src/index.ts)

**Risk:**

- Forms are vulnerable to Cross-Site Request Forgery
- OAuth callback could be manipulated
- State parameter missing in OAuth flow

**Remediation:** Add CSRF middleware:

```typescript
import csrf from "csurf";

const csrfProtection = csrf({ cookie: false });
app.use(csrfProtection);

// Add CSRF token to session
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Verify state parameter in OAuth callback
router.get(
  "/google/callback",
  csrfProtection,
  passport.authenticate("google", { failureRedirect: "/login" }),
  ...
);
```

---

### 7. **Weak Password/Validation for User Input**

**Location:** [src/api/auth/auth.service.ts](src/api/auth/auth.service.ts#L22-L35)

**Risk:**

- No email validation
- No XSS prevention on user input (name, profilePicture)
- Potential SQL injection if database backend added

**Remediation:**

```typescript
import { z } from "zod";

const UserCreateSchema = z.object({
  googleId: z.string().min(1),
  email: z.string().email("Invalid email format"),
  name: z.string().min(1).max(255),
  profilePicture: z.string().url("Invalid URL").optional(),
  role: z.literal("user"),
});

async upsertUser(profile: UserCreateInput): Promise<UserResponse> {
  const validated = UserCreateSchema.parse(profile);
  // ... rest of implementation
}
```

---

### 8. **Missing HTTPS Enforcement**

**Location:** [src/index.ts](src/index.ts#L33)

```typescript
cookie: {
  secure: process.env.NODE_ENV === "production",
```

**Risk:**

- Cookies can be sent over HTTP in non-production
- Man-in-the-middle attacks possible
- No HSTS headers

**Remediation:**

```typescript
// Add HSTS middleware
import helmet from "helmet";

app.use(helmet());

// Force HTTPS in production
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect(301, `https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });
}
```

---

## 🟡 MEDIUM-SEVERITY ISSUES

### 9. **Overly Permissive CORS Configuration**

**Location:** [src/index.ts](src/index.ts#L21)

```typescript
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
```

**Risk:**

- If `FRONTEND_URL` env var is not set, defaults to hardcoded localhost
- `credentials: true` with flexible origin could leak authentication

**Remediation:**

```typescript
const FRONTEND_URL = process.env.FRONTEND_URL;
if (!FRONTEND_URL) {
  throw new Error("FRONTEND_URL environment variable is required");
}

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  }),
);
```

---

### 10. **Insufficient Error Handling (Information Disclosure)**

**Location:** [src/api/auth/auth.controller.ts](src/api/auth/auth.controller.ts#L30-L36)

```typescript
const user = await this.authService.getMe(payload.id);
res.status(200).json(response);
} catch (error) {
  if (error instanceof Error && error.message === "User not found") {
    res.status(404).json({ error: "User not found" });
  }
```

**Risk:**

- Reveals whether user exists in system
- Full error messages could leak sensitive information
- Stack traces may be exposed in logs

**Remediation:**

```typescript
catch (error) {
  console.error("Auth error:", error);
  // Don't leak specific error details to client
  res.status(401).json({ error: "Invalid authentication credentials" });
}
```

---

### 11. **Missing Input Validation in `Bearer` Token**

**Location:** [src/api/auth/auth.controller.ts](src/api/auth/auth.controller.ts#L8-L13)

**Risk:**

- No length validation
- No character set validation
- Could cause DoS if extremely long tokens processed

**Remediation:**

```typescript
const authHeader = req.headers.authorization;
if (!authHeader?.startsWith("Bearer ") || authHeader.length > 1000) {
  res.status(401).json({ error: "Not authenticated" });
  return;
}

const token = authHeader.substring(7);
if (!/^[A-Za-z0-9._-]+$/.test(token)) {
  res.status(401).json({ error: "Invalid token format" });
  return;
}
```

---

### 12. **No Security Headers**

**Location:** [src/index.ts](src/index.ts)

**Missing Headers:**

- Content-Security-Policy (CSP)
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection

**Remediation:**

```typescript
import helmet from "helmet";

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Review based on actual needs
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);
```

---

## 🔵 LOW-SEVERITY ISSUES

### 13. **Passive User ID Validation**

**Location:** [src/api/auth/auth.controller.ts](src/api/auth/auth.controller.ts#L24)

```typescript
const user = await this.authService.getMe(payload.id);
```

**Risk:**

- No verification that requester owns the user ID
- If JWT is leaked, attacker can fetch any user's data

**Remediation:**

```typescript
// Ensure user can only access their own data
if (payload.id !== req.user?.id) {
  res.status(403).json({ error: "Forbidden" });
  return;
}
```

---

### 14. **Google OAuth Scopes Not Justified**

**Location:** [src/api/auth/auth.route.ts](src/api/auth/auth.route.ts#L11)

```typescript
passport.authenticate("google", { scope: ["profile", "email"] });
```

**Risk:**

- Requesting broader permissions than necessary
- Users may deny access to profile photos

**Note:** Current implementation is reasonable for basic needs.

---

### 15. **No Logging/Audit Trail for Auth Events**

**Location:** [src/api/auth/auth.service.ts](src/api/auth/auth.service.ts)

**Risk:**

- No record of failed login attempts
- Cannot detect suspicious activity
- Compliance violations (GDPR, SOC2)

**Remediation:**

```typescript
async upsertUser(profile: UserCreateInput): Promise<UserResponse> {
  let user = await this.authRepository.findByGoogleId(profile.googleId);

  if (!user) {
    logger.info("New user created via OAuth", { email: profile.email });
    // ...
  } else {
    logger.info("User logged in", { userId: user.id });
  }
  // ...
}
```

---

## Security Checklist

- [ ] Remove hardcoded JWT_SECRET fallback
- [ ] Implement token blacklist for logout
- [ ] Move JWT from URL to secure HTTP-only cookie
- [ ] Add rate limiting to auth endpoints
- [ ] Fix session cookie configuration (strict SameSite, maxAge)
- [ ] Implement CSRF protection
- [ ] Add HTTPS enforcement with HSTS
- [ ] Validate and sanitize user input
- [ ] Fix CORS configuration
- [ ] Add security headers (helmet.js)
- [ ] Implement audit logging for auth events
- [ ] Add user ID ownership verification
- [ ] Implement token refresh mechanism
- [ ] Add email verification for new accounts
- [ ] Consider 2FA/MFA implementation

---

## Environment Variables Required

```bash
# CRITICAL - Must be set
JWT_SECRET=<strong-random-string-min-32-chars>
SESSION_SECRET=<strong-random-string-min-32-chars>
FRONTEND_URL=<https://your-frontend-domain.com>

# Optional but recommended
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALLBACK_URL=<https://your-api-domain.com/api/auth/google/callback>
NODE_ENV=production
COOKIE_DOMAIN=.your-domain.com
```

---

## Recommended Priority Order for Fixes

1. **Immediate (Week 1):** Issues #1, #2, #3, #5, #9
2. **High Priority (Week 2):** Issues #4, #6, #7, #8
3. **Medium Priority (Week 3):** Issues #10, #11, #12
4. **Low Priority (Ongoing):** Issues #13, #14, #15

---

Generated: February 11, 2026
