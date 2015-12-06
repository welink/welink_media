'use strict';

var express = require('express');
var router = express.Router();
var auth = require('./authorization');
var config = require('../config');
var usersController = require(config.root + '/app/controllers/users');
var memosController = require(config.root + '/app/controllers/memos');

/**
 * Route middlewares
 */

const articleAuth = [auth.requiresLogin, auth.article.hasAuthorization];
const commentAuth = [auth.requiresLogin, auth.comment.hasAuthorization];



module.exports = function (app, passport) {
  // web routes
  router.get('/login', usersController.login);
  router.get('/signup', usersController.signup);
  router.get('/logout', usersController.logout);
  router.post('/users', usersController.create);
  router.post('/users/session',
    passport.authenticate('local', {
      failureRedirect: '/login',
      failureFlash: 'Invalid email or password.'
    }), usersController.session);
  router.get('/users/:userId', usersController.show);
  router.get('/auth/github',
    passport.authenticate('github', {
      failureRedirect: '/login'
    }), usersController.signin);
  router.get('/auth/github/callback',
    passport.authenticate('github', {
      failureRedirect: '/login'
    }), usersController.authCallback);

  router.param('userId', usersController.load);

  // article routes
  router.param('id', memosController.load);
  router.get('/articles', memosController.index);
  router.get('/articles/new', auth.requiresLogin, memosController.new);
  router.post('/articles', auth.requiresLogin, memosController.create);
  router.get('/articles/:id', memosController.show);
  router.get('/articles/:id/edit', articleAuth, memosController.edit);
  router.put('/articles/:id', articleAuth, memosController.update);
  router.delete('/articles/:id', articleAuth, memosController.destroy);
  return router;
};