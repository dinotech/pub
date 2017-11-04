var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var flash = require('connect-flash');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressValidator = require('express-validator');
var mongo = require('mongodb');
mongoose.connect('mongodb://localhost/onthelist');
var db = mongoose.connection;

//Routes maintain
var index = require('./routes/index');
var dashboard = require('./routes/dashboard');
var manageVendor = require('./routes/manageVendor');
var manageEvent = require('./routes/manageEvent');
var manageFeaturedList = require('./routes/manageFeaturedList');
var manageDj = require('./routes/manageDj');
var manageAgreement = require('./routes/manageAgreement');
var manageDoorman = require('./routes/manageDoorman');
var manageFeaturedPlan = require('./routes/manageFeaturedPlan');
var payments = require('./routes/payments');
var thelist = require('./routes/thelist');
var manageGenres = require('./routes/manageGenres');
var manageCurrency = require('./routes/manageCurrency');
var manageCommission = require('./routes/manageCommission');
var guestsReport = require('./routes/guestsReport');
var managePayment = require('./routes/managePayment');
var manageReferral = require('./routes/manageReferral');
var referralVendor = require('./routes/referralVendor');
var referralPayment = require('./routes/referralPayment');
var pushNotification = require('./routes/pushNotification');
var inbox = require('./routes/inbox');

// Init App
var app = express();
app.io = require('socket.io')();
// View Engine Setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({
	secret: 'secret',
	resave: false,
	saveUninitialized: false
}));

// Passport Init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.locals.moment = require('moment');


// passport config
/*var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());*/

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

//Routes handler
app.use('/', index);
app.use('/dashboard', dashboard);
app.use('/manageVendor', manageVendor);
app.use('/manageEvent', manageEvent);
app.use('/manageFeaturedList', manageFeaturedList);
app.use('/manageDj', manageDj);
app.use('/manageAgreement', manageAgreement);
app.use('/manageDoorman', manageDoorman);
app.use('/manageFeaturedPlan', manageFeaturedPlan);
app.use('/payments', payments);
app.use('/thelist', thelist);
app.use('/manageGenres', manageGenres);
app.use('/manageCurrency', manageCurrency);
app.use('/manageCommission', manageCommission);
app.use('/guestsReport', guestsReport);
app.use('/managePayment', managePayment);
app.use('/manageReferral', manageReferral);
app.use('/referralVendor', referralVendor);
app.use('/referralPayment', referralPayment);
app.use('/pushNotification', pushNotification);
app.use('/inbox', inbox);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

//http://jsfiddle.net/z3bh5gh2/2/