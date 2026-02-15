# OAuth Migration Summary - JWT Token Implementation

## Overview

Heat Seasons has been migrated from a custom email/password authentication system to Google OAuth 2.0 using Passport.js with JWT token-based authentication. This approach combines server-side OAuth verification with client-side JWT tokens for stateless API authentication.

## Architecture Changes

### Backend

- **OAuth Flow**: Google OAuth 2.0 handled by Passport.js
- **Session**: Used temporarily during OAuth flow, not for API auth
- **Token Generation**: Backend generates JWT after successful OAuth
- **API Authentication**: JWT tokens passed via Authorization header

### Frontend

- **Token Storage**: JWT stored in localStorage after OAuth callback
- **API Requests**: Token automatically included in Authorization header
- **Session Independence**: No reliance on cookies/sessions for API calls
- **Cross-Origin**: Works seamlessly across different domains/ports

## Key Components Modified

### Backend Files

1. **packages/backend/src/utils/jwt.ts** (NEW)
   - JWT generation and verification
   - Token contains: user id, email, role
   - Expires in 24h

2. **packages/backend/src/config/passport.ts**
   - Google OAuth strategy configuration
   - User creation/update on first OAuth login
   - Serialization for session persistence

3. **packages/backend/src/models/user.model.ts**
   - Removed: `password` field
   - Added: `googleId`, `profilePicture`, `updatedAt`
   - Kept: `id`, `email`, `name`, `role`, `createdAt`

4. **packages/backend/src/api/auth/**
   - `auth.controller.ts`:
     - `getMe()` verifies JWT from Authorization header
     - `googleCallback()` generates JWT and redirects with token in URL
   - `auth.service.ts`: Added `generateToken()` method
   - `auth.route.ts`: Routes for OAuth flow and authenticated endpoints

5. **packages/backend/src/index.ts**
   - Session middleware for OAuth callback flow
   - CORS with credentials for passport

### Frontend Files

1. **packages/frontend/src/utils/tokenManager.ts** (NEW)
   - localStorage-based token management
   - Get/set/remove/check token helpers

2. **packages/frontend/src/hooks/useAuthToken.ts** (NEW)
   - Sets Authorization header with token in apiClient
   - Runs on app initialization

3. **packages/frontend/src/pages/AuthCallback.tsx** (NEW)
   - Handles OAuth callback redirect
   - Extracts token from URL
   - Stores token and redirects to dashboard

4. **packages/frontend/src/providers/AuthProvider.tsx**
   - Extracts token from URL query parameter
   - Stores token in localStorage via TokenManager
   - Fetches user profile using JWT
   - Provides `loginWithGoogle()` and `logout()` methods

5. **packages/frontend/src/components/features/Auth/AuthForm.tsx**
   - Replaced: Email/password form with Google login button
   - Simplified: Single-click authentication

6. **packages/frontend/src/main.tsx**
   - Initializes `useAuthToken` hook to set headers

## API Changes

### New Endpoints

- `GET /api/auth/google` - Initiates Google OAuth consent
- `GET /api/auth/google/callback` - OAuth callback, returns JWT in redirect

### Modified Endpoints

- `GET /api/auth/me` - Now requires `Authorization: Bearer <token>` header instead of session
- `POST /api/auth/logout` - Clears frontend token (backend logs off session)

### Removed Endpoints

- `POST /api/auth/login` (email/password)
- `POST /api/auth/register` (email/password)
- `POST /api/auth/refresh` (no longer needed with single JWT flow)

## Authentication Flow

```
1. User clicks "Sign in with Google"
   ↓
2. Frontend redirects to GET /api/auth/google
   ↓
3. Passport middleware authenticates with Google
   ↓
4. Google shows consent screen
   ↓
5. User approves
   ↓
6. Google redirects to GET /api/auth/google/callback with auth code
   ↓
7. Passport exchanges code for profile
   ↓
8. Backend creates/finds user in database
   ↓
9. Backend generates JWT token
   ↓
10. Backend redirects to frontend: http://localhost:3000/auth/callback?token=JWT
   ↓
11. Frontend extracts token from URL
   ↓
12. Frontend stores token in localStorage
   ↓
13. Frontend sets Authorization header: Bearer JWT
   ↓
14. Frontend fetches user profile via GET /api/auth/me with token
   ↓
15. User authenticated and logged in
```

## Configuration

### Required Environment Variables

```env
# Backend (.env)
NODE_ENV=development
PORT=3001

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
FRONTEND_URL=http://localhost:3000

SESSION_SECRET=your_session_secret_change_in_production
JWT_SECRET=your_jwt_secret_change_in_production
```

Obtain Google credentials from [Google Cloud Console](https://console.cloud.google.com):

1. Create OAuth 2.0 credentials (Web application)
2. Add `GOOGLE_CALLBACK_URL` as authorized redirect URI
3. Copy Client ID and Secret to .env

### Dependencies

**Added**:

- `passport` (^0.7.0)
- `passport-google-oauth20` (^2.0.0)
- `express-session` (^1.17.3)
- `jsonwebtoken` (^9.0.2)
- TypeScript types: `@types/passport`, `@types/passport-google-oauth20`, `@types/express-session`

**Removed**:

- `bcryptjs` (no password hashing needed)

## Data Migration

### users.json Changes

- Removed: `password`, `passwordHash`
- Added: `googleId`, `profilePicture`, `updatedAt`

## Benefits

1. **No Password Storage**: Eliminates credential storage and management
2. **Token-Based**: Stateless API authentication, works across domains
3. **Google Handling**: OAuth flow delegated to trusted provider
4. **Simple**: Removes registration/password reset complexity
5. **SPA Friendly**: JWT stored client-side, works perfectly with SPAs
6. **Scalable**: Tokens enable horizontal scaling without session state

## Testing

### Manual Test Steps

1. Set up Google OAuth credentials
2. Configure `.env` with credentials and secrets
3. Run `npm install` in backend
4. Start backend: `npm run dev` (from packages/backend)
5. Start frontend: `npm run dev` (from packages/frontend)
6. Navigate to `http://localhost:3000/login`
7. Click "Sign in with Google"
8. Authorize in Google consent screen
9. Should redirect to `/auth/callback` with token in URL
10. Frontend extracts token and redirects to dashboard
11. User profile should display

### What to Verify

- Redirects to Google OAuth consent screen
- After approval, redirects to `/auth/callback?token=...`
- Token stored in localStorage
- User profile displays on dashboard
- Authorization header includes token in API requests
- Logout clears token from localStorage
- Navigating directly to dashboard with valid token loads user

## Future Enhancements

- Token refresh endpoint (refresh token rotation)
- Add persistent session store (Redis, MongoDB)
- Token expiration and refresh logic
- Multiple OAuth providers (GitHub, Discord)
- Account linking for existing users
