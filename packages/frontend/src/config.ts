const apiBaseUrl = "http://localhost:3001/api";
export const config = {
  apiBaseUrl,
  authRoute: `${apiBaseUrl}/auth`,
  userRoute: `${apiBaseUrl}/users`,
  racerRoute: `${apiBaseUrl}/racers`,
  racesRoute: `${apiBaseUrl}/races`,
  seasonRoute: `${apiBaseUrl}/seasons`,
  leaderboardRoute: `${apiBaseUrl}/leaderboard`,
};
