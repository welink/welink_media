'use strict';

/*!
 * Module dependencies.
 */

const mongoose = require('mongoose');
const User = mongoose.model('User');
const local = require('./passport/local');
const github = require('./passport/github');

/**
 * Expose
 */

module.exports = function (passport) {

  // serialize sessions
  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(function(id, done) {
    User.findOne({ _id: id }, function (err, user) {
      done(err, user)
    })
  })

  // use these strategies
  passport.use(local);
  passport.use(github);
};
