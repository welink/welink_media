'use strict';

/**
 * Module dependencies.
 */
var errorHelper = require('../helpers/errors');

const mongoose = require('mongoose');
const wrap = require('co-express');
const User = mongoose.model('User');

/**
 * Show sign in form
 */

exports.signin = function (req, res) {
  res.render('users/signin', {
    title: 'Sign in',
    user: new User()
  });
};

/**
 * Show sign up form
 */

exports.signup = function (req, res) {
  res.render('users/signup', {
    title: 'Sign up',
    user: new User()
  });
};

/**
 * Logout
 */

exports.logout = function (req, res) {
  req.logout();
  res.redirect('/login');
};

/**
 * Create user
 */

exports.create = function (req, res, next) {
  var user = new User(req.body)
  user.provider = 'local'
  user.save(function (err, new_user) {
    if (err) {
      return res.render('users/signup', {
        errors: errorHelper.proper(err.errors),
        user: user,
        title: 'Sign up'
      })
    } else {
      console.log(user)
      // manually login the user once successfully signed up
      req.logIn(user, function(err) {
        if (err) {
          console.log(err)
          return next(err)
        }
        return res.redirect('/home')
      })
    }
  })
}



exports.getForgotPassword = function (req, res) {
  res.render('users/forgot-password', {
    title: 'Forgot Password'
  });
}


exports.postForgotPassword = function (req, res) {

  async.waterfall([
    function(next) {
      crypto.randomBytes(16, function(err, buf) {
        var token = buf.toString('hex');
        next(err, token);
      });
    },
    function(token, next) {
      User.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {

        if (!user) {
          return errorHelper.custom(res, { msg : 'No account with that email address exists.', code: 404 });
        }

        user.reset_password_token = token;
        user.reset_password_expires = Date.now() + 43200000; // 12 hour

        user.save(function(err) {
          next(err, token, user);
        });
      });
    }, function(token, user, next) {
        user.url_reset_password = req.protocol + '://' + req.headers.host + '/reset/' + token
      }
    ], function(err) {
      if (err) {
        err.status = 500;
        errorHelper.custom(res, err);
      }
      return res.json({message: 'success', status: 200});
    });
}


exports.getResetPassword = function (req, res) {
  User
    .findOne({ reset_password_token: req.params.token })
    .where('reset_password_expires').gt(Date.now())
    .exec(function (err, user) {
      if(user) {
        res.render('users/reset-password', {
          title: 'Forgot Password'
        });
      } else {
        req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
        return res.redirect('/');
      }
    })

}

exports.postResetPassword = function (req, res) {

  req.assert('password', 'Password must be at least 6 characters long.').len(6);
  req.assert('confirm_password', 'Please enter confirm password same with password.').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    err.status = 500;
    errorHelper.custom(res, errors);
  }

  async.waterfall([
    function(done) {
      User
        .findOne({ reset_password_token: req.params.token })
        .where('reset_password_expires').gt(Date.now())
        .exec(function(err, user) {
          if (!user) {
            return errorHelper.custom(res, { msg : 'Password reset token is invalid or has expired.', code: 410 });
          }

          user.password = req.body.password;
          user.reset_password_token = '';
          user.reset_password_expires = '';

          user.save(function(err) {
            if(err) {
              return errorHelper.mongoose(res, err);
            }
            done(user);
          });
        });
    }], function(user) {
      user.url_login = req.protocol + '://' + req.headers.host + '/login'
    });
}


