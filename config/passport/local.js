'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
const User = mongoose.model('User');

/**
 * Expose
 */

module.exports = new LocalStrategy({
    usernameField: 'phone',
    passwordField: 'password'
  },
  function(phone, password, done) {

      User.findOne( { phone: phone } , function (err, user) {

        if (err) {
          return done(err)
        }

        if (!user) {
          return done(null, false, { message: 'Your phone not register' })
        }

        if (!user.authenticate(password)) {
          return done(null, false, { message: 'invalid login or password' })
        }

        return done(null, user)
      })
    }
);
