'use strict';

var config = require('../config');
var lodash = require('lodash')
var Auth = require('./authorization');
var homeController = require('../app/controllers/home')
var fs = require('fs');
var API = {}

module.exports = function(app, passport) {
  app.get('/', homeController.index);
  app.use('/web', require('./web')(app, passport));
  app.use('/api', require('./api')(app, passport));
};


