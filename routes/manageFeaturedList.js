var express = require('express');
var multer = require('multer');
var upload = multer({ dest: 'public/images/events/'});
var router = express.Router();


var Event = require('../models/event');
var Dj = require('../models/dj');

/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next){

		Event.getFeaturedEvent(function(err, events){

			if(err){
					throw err;	
				}

					allevents = [];
					events.forEach(function(doc, err){
						allevents.push(doc);
					});

					res.render('manageFeaturedList',  {flash: {allevents: allevents, successmsg: req.flash('successmsg'), title: 'Manage Featuerd List', role: req.user.role, id: req.user._id}});				

		});
	
});

router.post('/updfeaturedstatus/:id', ensureAuthenticated, function(req, res, next){
	var id = req.params.id;
	var featuredstatus = req.body.featuredstatus;

	
	if(!featuredstatus)
	{
		featuredstatus = 'false';
	}

	var updEvent = {
		featuredstatus : featuredstatus
	};
	
	Event.updateFeaturedUser(id, updEvent, function(err, updUser){
			if(err){
				throw err;
			}
	});
            if(featuredstatus == 'true')
            {
				req.flash('successmsg', 'This Event is sort listed in Featerd List.');
            } else{
                req.flash('successmsg', 'This Event is no longer in Featerd List.');
            }

                res.redirect('/manageFeaturedList');
});

router.get('/addEvent/:id',ensureAuthenticated, function(req, res, next){
	
	var id = req.params.id;

	Event.getEventById(id, function(err, event){
		if(err){
			throw err;
		}

		Dj.getDj(function(err, djs){
			if(err){
				throw err;	
			}

			alldj = [];
			djs.forEach(function(doc, err){
				alldj.push(doc);
			});

			res.render('addEvent', {event: event, alldj: alldj, flash: { title: 'Edit Events', role: req.user.role, id: req.user._id}});
		});	
	});
	
});

router.get('/delEvent/:id', ensureAuthenticated, function(req, res, next){
	var id = req.params.id;

	Event.delEventById(id, function(err, user){
		if(err){
			throw err;
		}
		req. flash('successdel', 'Event Successfully Deleted.');
		res.redirect('/manageFeaturedList');
	});
});

router.post('/addEvent/:id', upload.any(),ensureAuthenticated, function(req, res, next){
	
	var id = req.params.id;
	var userid = req.body.userid;
	var eventname = req.body.eventname;
	var eventdate = req.body.eventdate;
	var eventtime = req.body.eventtime;
	var entryfee = req.body.entryfee;
	var eventdetails = req.body.eventdetails;
	var dj = req.body.dj;

	if(!dj){
	var eventdj = '';
	} else{
	var	eventdj = dj;
	}

	//console.log(eventdj);
	var valueofimage = req.files;
	if(valueofimage != ''){
	    var str = valueofimage[0].destination;
	    var res1 = str.replace("public/", "");

	    var eventimage = res1+valueofimage[0].filename;
	    
	} else{
		var eventimage = "";
	}

	var updEvent = {
		userid : userid,
		eventname : eventname,
		eventdate : eventdate,
		eventtime : eventtime,
		entryfee : entryfee,
		eventdetails : eventdetails,
		eventdj : eventdj,
		eventimage : eventimage
	};
	

				Event.updateEvent(id, updEvent, function(err, updEvent){
                    if(err) throw err;
                });
                req.flash('successmsg', 'Your Information is Updated.');

                res.redirect('/manageFeaturedList');

});

router.get('/manageFeaturedPlan', ensureAuthenticated, function(req, res, next){
	res.render('/manageFeaturedPlan', {flash: { title: 'Manage Featured Plans' }});
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