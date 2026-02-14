export const featureFlags = {
  // This flag toggles use of the authentication system.
  // Because there's no point to logging in right now, this is set to false for now.
  // We can set this to true when we want to enable the login/register flow and profile page.
  useAuth: import.meta.env.VITE_USE_AUTH === "true",
};
