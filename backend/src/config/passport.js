const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { prisma } = require('./db');
const config = require('./env');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/api/auth/github/callback",
    scope: ['user:email']
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      const githubId = profile.id;
      const username = profile.username;
      const avatarUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
      const fullName = profile.displayName || username;

      if (!email) {
        return done(new Error('No email found in GitHub profile'), null);
      }

      // Check if user exists
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { githubId: githubId },
            { email: email }
          ]
        }
      });

      if (user) {
        // Update githubId if not set (linking account)
        if (!user.githubId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { 
              githubId: githubId,
              avatarUrl: user.avatarUrl || avatarUrl // Update avatar if missing
            }
          });
        }
        return done(null, user);
      }

      // Create new user
      // Ensure username is unique
      let uniqueUsername = username;
      let counter = 1;
      while (await prisma.user.findUnique({ where: { username: uniqueUsername } })) {
        uniqueUsername = `${username}${counter}`;
        counter++;
      }

      user = await prisma.user.create({
        data: {
          username: uniqueUsername,
          email: email,
          fullName: fullName,
          githubId: githubId,
          avatarUrl: avatarUrl,
          authProvider: 'github',
          role: 'user'
        }
      });

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

module.exports = passport;
