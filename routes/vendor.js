
var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var generator = require('generate-password');
var router = express.Router();

var User = require('../models/user');
var Enduser = require('../models/enduser');
var Event = require('../models/event');
var Dj = require('../models/dj');
var Agreement = require('../models/agreement');
var GuestList = require('../models/guestlist');
var CardList = require('../models/cardlist');

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {role: "vendor", flash: {successmsg: req.flash('successmsg'), errormsg: req.flash('errormsg')}});
});

passport.use(new LocalStrategy(
  function(email, password, done) {
    
        User.getUserByUsername(email, function(err, user){
            if(err) throw err;
            if(!user){
                return done(null, false, {message: 'Unkonwn User'});
            }

            User.comparePassword(password, user.password, function(err, isMatch){
                if(err) throw err;
                if(isMatch && user.agreement != '' && user.role == "vendor"){
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Invalid Password'});
                }
            });
        });
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

// Login
router.post('/login', passport.authenticate('local', {successRedirect:'/checkAgreement', failureRedirect:'/loginfail',failureFlash: true}), function(req, res) {
    
    res.redirect('/dashboard');
});


function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('errormsg', 'Your are not Logged in');
    res.redirect('/');
  }
}

module.exports = router;
