'use strict';

var lodash = require('lodash')
var Auth = require('./authorization');
var homeController = require('../app/controllers/home')
var usersController = require('../app/controllers/users')

var fs = require('fs');
var API = {}

module.exports = function(app, passport) {
  app.get('/', homeController.index);
  app.get('/signin', usersController.signin);
  app.get('/signup', usersController.signup);
  app.post('/users', usersController.create);
  app.post('/users/session',
    passport.authenticate('local', {
      failureRedirect: '/users/signin',
      failureFlash: 'Invalid phone or password.'
    }), usersController.session);
  app.use('/api', require('./api')(app, passport));
};


