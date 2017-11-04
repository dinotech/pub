
var express = require('express');
var expressSession = require('express-session')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var passportLocal = require('passport-local');
var router = express.Router();
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession({
	secret: process.env.SESSION_SECRET || 'secret',
	resave: false,
	saveUninitialized: false
}));

//passport use
app.use(passport.initialize());
app.use(passport.session());

passport.use(new passportLocal.Strategy(function(username, password, done){
	if(username == 'asif@gmail.com' && password == 'asif123'){
		done(null, {id: username, name:username});
	} else {
		done(null, null);
	}
}));

passport.serializeUser(function(user, done){
	done(null, user.id);
});

passport.deserializeUser(function(user, done){
	done(null, {id: id, name: id});
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login');
});


router.post('/', passport.authenticate('local'), function(req, res, next) {
  res.redirect('users');
});

module.exports = router;
