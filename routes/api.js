var express = require('express');
var router = express.Router();
var config = require('../config');
var passport = require('passport');
var lodash = require('lodash')
var Auth = require('./authorization');
var fs = require('fs');

module.exports = function (app, passport) {

  return router;
};