# OAuth Migration Summary

## Overview

Heat Seasons has been migrated from a custom email/password authentication system to Google OAuth 2.0 using Passport.js. This simplification removes the need to store user credentials while providing a secure, proven authentication mechanism.

## Architecture Changes

### Backend

- **Added**: Express-session for session management, Passport.js with Google OAuth 2.0 strategy
- **Removed**: JWT/token-based auth, password hashing (bcrypt), email/password validation logic
- **Session Flow**: User authenticates via Google → Passport creates session → Session stored in memory (dev) or persistent store (production)

### Frontend

- **Changed**: OAuth redirect-based flow instead of form submission
- **Simplified**: Removed email/password input forms, toggle between login/register
- **Updated**: AuthContext now manages session state via HTTP cookies (credentials: "include")

## Key Components Modified

### Backend Files

1. **packages/backend/src/config/passport.ts** (NEW)
   - Google OAuth strategy configuration
   - User creation/update on first OAuth login
   - Serialization for session persistence

2. **packages/backend/src/models/user.model.ts**
   - Removed: `password` field
   - Added: `googleId`, `profilePicture`, `updatedAt`
   - Kept: `id`, `email`, `name`, `role`, `createdAt`

3. **packages/backend/src/api/auth/**
   - `auth.repository.ts`: Added `findByGoogleId()`, implemented `create()` and `update()`
   - `auth.service.ts`: Added `findOrCreateUser()`, `getUser()`, OAuth-focused methods
   - `auth.controller.ts`: Added `googleCallback()`, simplified `logout()`
   - `auth.route.ts`: Added `GET /google`, `GET /google/callback`

4. **packages/backend/src/index.ts**
   - Added: express-session middleware, passport initialization
   - Updated: CORS with credentials support, session configuration

### Frontend Files

1. **packages/frontend/src/contexts/AuthContext.tsx**
   - Removed: `login()`, `register()` methods
   - Added: `loginWithGoogle()` method
   - Changed: User state now managed via HTTP sessions

2. **packages/frontend/src/providers/AuthProvider.tsx**
   - Simplified: OAuth redirect instead of form submission
   - Updated: Session-based auth checks (removed test userId headers)
   - Added: Cookie-based credential handling

3. **packages/frontend/src/components/features/Auth/AuthForm.tsx**
   - Replaced: Email/password form with Google login button
   - Simplified: Removed form handling, registration toggle

4. **packages/frontend/src/pages/LoginRegister.tsx**
   - Removed: Registration mode toggle
   - Simplified: Single Google login flow

## API Changes

### New Endpoints

- `GET /api/auth/google` - Initiates Google OAuth consent screen
- `GET /api/auth/google/callback` - Google OAuth callback, redirects to dashboard

### Unchanged Endpoints

- `GET /api/auth/me` - Fetches authenticated user (requires session)
- `POST /api/auth/logout` - Logs out user, destroys session

### Removed Endpoints

- `POST /api/auth/login` (email/password)
- `POST /api/auth/register` (email/password)
- `POST /api/auth/refresh` (JWT tokens)

## Configuration

### Required Environment Variables

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=your_session_secret_change_in_production
```

Obtain credentials from [Google Cloud Console](https://console.cloud.google.com):

1. Create OAuth 2.0 credentials (Web application)
2. Add `GOOGLE_CALLBACK_URL` as authorized redirect URI
3. Copy Client ID and Secret to .env

## Dependencies

### Added

- `passport` (^0.7.0)
- `passport-google-oauth20` (^2.0.0)
- `express-session` (^1.17.3)
- TypeScript types: `@types/passport`, `@types/passport-google-oauth20`, `@types/express-session`

### Removed

- `jsonwebtoken` (JWT tokens)
- `bcryptjs` (password hashing)

## Data Migration

### users.json Changes

- Removed: `password`, `passwordHash`
- Added: `googleId`, `profilePicture`, `updatedAt`
- Example:
  ```json
  {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "googleId": "100000000000000000000",
    "email": "john@example.com",
    "name": "John Doe",
    "profilePicture": "https://lh3.googleusercontent.com/a-/...",
    "role": "user",
    "createdAt": "2025-08-15T10:00:00Z",
    "updatedAt": "2025-08-15T10:00:00Z"
  }
  ```

## Flow Diagrams

### Login Flow

```
User clicks "Sign in with Google"
  ↓
Frontend redirects to /api/auth/google
  ↓
Passport initiates Google OAuth consent
  ↓
User authorizes app at Google
  ↓
Google redirects to /api/auth/google/callback with code
  ↓
Passport exchanges code for profile
  ↓
Backend finds or creates user
  ↓
Session established
  ↓
Redirect to /dashboard
  ↓
AuthProvider checks /api/auth/me
  ↓
User logged in
```

### Logout Flow

```
User clicks logout
  ↓
POST /api/auth/logout
  ↓
req.logout() destroys session
  ↓
Frontend redirects to home
```

## Benefits

1. **Security**: No password storage, delegation to Google's proven OAuth infrastructure
2. **Simplicity**: Reduced code complexity, fewer validation/hashing concerns
3. **UX**: Single-click authentication via trusted Google account
4. **Profile Data**: Automatic access to user profile picture from Google
5. **Maintenance**: Fewer accounts to manage, no password reset flows

## Testing

### Manual Testing Steps

1. Set up Google OAuth credentials in Cloud Console
2. Copy credentials to `.env`
3. Start backend: `npm run dev`
4. Start frontend: `npm run dev`
5. Navigate to login page
6. Click "Sign in with Google"
7. Authorize in Google consent screen
8. Verify redirect to dashboard and user display

### What to Verify

- Session created after OAuth callback
- User profile displays correctly with picture
- Logout destroys session and redirects
- Multiple logins with same Google account return existing user
- `/api/auth/me` returns authenticated user with session

## Future Enhancements

- Implement persistent session store (MongoDB, Redis)
- Add user profile management (edit name, picture)
- Support additional OAuth providers (GitHub, Discord)
- Implement session timeout/refresh
- Add account linking for existing users
