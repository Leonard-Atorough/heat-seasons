import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Container } from "../containers/container";
import { IAuthService } from "src/api/auth/auth.service.interface";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "";

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
        const authService = container.serviceLocator.get("AuthService") as IAuthService;

        const user = await authService.findOrCreateUser({
          googleId: profile.id,
          email: profile.emails?.[0]?.value || "",
          name: profile.displayName,
          profilePicture: profile.photos?.[0]?.value,
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
    const authService = container.serviceLocator.get("AuthService") as IAuthService;
    const user = await authService.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
