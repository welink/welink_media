var express = require('express');
var Route = express.Router();
var config = require('../config');
var passport = require('passport');
var lodash = require('lodash')
var Auth = require('./authorization');
var fs = require('fs');
var API = {}

exports = module.exports = function(app, passport) {
  app.use('/web', require('./web')(app, passport));
  app.use('/api', require('./api')(app, passport));
  app.get('/', function(req, res) {
    res.render('index', {
      title: 'Express 4'
    });
  })
};


