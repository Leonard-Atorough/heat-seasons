// In Vite, only variables prefixed with VITE_ are exposed to the browser bundle.
// Set VITE_API_URL in your .env file (local dev) or in the statichost.eu / CI
// build settings (production) to point at your Railway backend.
const apiBaseUrl = `${import.meta.env.VITE_API_URL ?? "http://localhost:3001"}/api`;
export const config = {
  apiBaseUrl,
  authRoute: `${apiBaseUrl}/auth`,
  userRoute: `${apiBaseUrl}/users`,
  racerRoute: `${apiBaseUrl}/racers`,
  racesRoute: `${apiBaseUrl}/races`,
  seasonRoute: `${apiBaseUrl}/seasons`,
  leaderboardRoute: `${apiBaseUrl}/leaderboard`,
};
