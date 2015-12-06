'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const GithubStrategy = require('passport-github').Strategy;
const config = require('../index');
const User = mongoose.model('User');

/**
 * Expose
 */

module.exports = new GithubStrategy({
    clientID: 'fccc4c051c728b3e1a06',
    clientSecret: 'f91ff156262718d61dadc1f40249b549a8ef8a5d',
    callbackURL: 'http://localhost:3000/auth/github/callback'
  },
  function (accessToken, refreshToken, profile, done) {
    const options = {
      criteria: { 'github.id': profile.id }
    };
    User.load(options, function (err, user) {
      if (err) return done(err);
      if (!user) {
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          username: profile.username,
          provider: 'github',
          github: profile._json
        });
        user.save(function (err) {
          if (err) console.log(err);
          return done(err, user);
        });
      } else {
        return done(err, user);
      }
    });
  }
);
