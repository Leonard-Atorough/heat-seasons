// In Vite, only variables prefixed with VITE_ are exposed to the browser bundle.
// In dev mode, use a relative path so the Vite proxy (vite.config.ts) catches /api requests
// and forwards them to localhost:3001.
// In production, use the full Railway backend URL.
const apiBaseUrl = import.meta.env.DEV ? "/api" : "http://heat-seasons.up.railway.app/api";
export const config = {
  apiBaseUrl,
  authRoute: `${apiBaseUrl}/auth`,
  userRoute: `${apiBaseUrl}/users`,
  racerRoute: `${apiBaseUrl}/racers`,
  racesRoute: `${apiBaseUrl}/races`,
  seasonRoute: `${apiBaseUrl}/seasons`,
  leaderboardRoute: `${apiBaseUrl}/leaderboard`,
};
