// In Vite, only variables prefixed with VITE_ are exposed to the browser bundle.
// Always use a relative /api path: in dev the Vite proxy (vite.config.ts) forwards requests
// to localhost:3001; in production the Netlify proxy (netlify.toml) forwards them to Railway.
// This keeps cookies same-site in both environments.
const apiBaseUrl = "/api";
export const config = {
  apiBaseUrl,
  authRoute: `${apiBaseUrl}/auth`,
  userRoute: `${apiBaseUrl}/users`,
  racerRoute: `${apiBaseUrl}/racers`,
  racesRoute: `${apiBaseUrl}/races`,
  seasonRoute: `${apiBaseUrl}/seasons`,
  leaderboardRoute: `${apiBaseUrl}/leaderboard`,
};