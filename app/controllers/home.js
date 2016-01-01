'use strict';

exports.index = function(req, res) {
  console.log(req.user);
  if (req.user) return res.render('home');
  res.render('landing');
};

exports.signup = function(req, res) {
  if (req.user) return res.redirect('/home');
  res.render('signup');
};
