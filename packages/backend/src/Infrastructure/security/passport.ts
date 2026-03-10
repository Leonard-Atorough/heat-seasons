import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Container } from "../dependency-injection/container";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } from "../../env";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const container = Container.getInstance();
        const authService = container.getAuthService();

        const user = await authService.upsertUser({
          googleId: profile.id,
          email: profile.emails?.[0]?.value || "",
          name: profile.displayName,
          profilePicture: profile.photos?.[0]?.value,
          role: "user",
        });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const container = Container.getInstance();
    const authService = container.getAuthService();
    const user = await authService.getMe(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
