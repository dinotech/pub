var express = require('express');
var router = express.Router();

var Event = require('../models/event');
var GuestList = require('../models/guestlist');

router.get('/', ensureAuthenticated, function(req, res, next){
	var userid = req.user._id;
	Event.getEventByUserId(userid, function(err, events){
		if(err){
			throw err;
		}
		res.render('guestsReport', { events : events, flash: { title : 'Guest List Report', role: req.user.role, id: req.user._id}});
	})
});

router.get('/getGuests/:id', function(req, res, next){

	var id = req.params.id;

	GuestList.getGuestListByEventId(id, function(err, guestlists){
		if(err){
			throw err;
		}
		res.send(guestlists);
	});

});

// Chech Authentication
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('error_msg', 'Your are not Logged in');
    res.redirect('/');
  }
}
module.exports = router;