// In Vite, only variables prefixed with VITE_ are exposed to the browser bundle.
// For local dev, use localhost. For production, use the Railway backend.
const apiBaseUrl = `${import.meta.env.DEV ? "http://localhost:3001" : "http://heat-seasons.up.railway.app"}/api`;
export const config = {
  apiBaseUrl,
  authRoute: `${apiBaseUrl}/auth`,
  userRoute: `${apiBaseUrl}/users`,
  racerRoute: `${apiBaseUrl}/racers`,
  racesRoute: `${apiBaseUrl}/races`,
  seasonRoute: `${apiBaseUrl}/seasons`,
  leaderboardRoute: `${apiBaseUrl}/leaderboard`,
};
