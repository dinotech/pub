var express = require('express');
var generator = require('generate-password');
var moment = require('moment');
var router = express.Router();

var Event = require('../models/event');
var GuestList = require('../models/guestlist');
// Models Included



/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) {

	var userid = req.user._id;
	//var dates = moment(Date.now()).format('MM/DD/YYYY');
	//console.log(dates);
	Event.getEventByDate(userid, function(err, event){
		if(err){
			throw err;
		}
		
		Event.getEventByPublishId(userid, function(err, events){
			if(err){
				throw err;
			}
			
			if(event){
				GuestList.getGuestListByUserEventId(userid, event._id, function(err, guestlists){
					if(err){
						throw err;
					}
					
					res.render('guestlist', { guestlists : guestlists, event : event, eventlist : events, flash: { title: 'Guest List', role: req.user.role, id: req.user._id }});
				});
			} else{
				res.render('guestlist', { event : "", flash: { title: 'Guest List', role: req.user.role, id: req.user._id }});
			}
		});
	});
});

router.get('/:id', ensureAuthenticated, function(req, res, next) {

	var userid = req.user._id;
	var eventid = req.params.id
	//console.log(dates);
	GuestList.getGuestListByUserEventId(userid, eventid, function(err, guestlists){
		Event.getEventByUserEventId(userid, eventid, function(err, event){
			if(err){
				throw err;
			}
			Event.getEventByPublishId(userid, function(err, events){
				if(err){
					throw err;
				}
				
				res.render('guestlist', { guestlists: guestlists, event : event, eventlist : events, flash: { title: 'Guest List' }, role: req.user.role, id: req.user._id});
			});
		});
	});
});

router.get('/requestaccepted/:id', function(req, res, next){

	var id = req.params.id;
	var updGuestList = {
		requesttable : "accepted",
		status : "Accepted"
	};
	GuestList.updRequestById(id, updGuestList, function(err, guestlist){
		if(err){
			throw err;
		}
		res.redirect('/thelist');
	});

});

router.get('/requestcancelled/:id', function(req, res, next){

	var id = req.params.id;
	var updGuestList = {
		requesttable : "cancelled",
		status : "Cancelled"
	};
	GuestList.updRequestById(id, updGuestList, function(err, guestlist){
		if(err){
			throw err;
		}
		res.redirect('/thelist');
	});

});

// Chech Authentication
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('errormsg', 'Your are not Logged in');
    res.redirect('/');
  }
}
module.exports = router;
