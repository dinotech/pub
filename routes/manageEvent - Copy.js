var express = require('express');
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'public/images/events/')
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + file.originalname);
    }
});
var upload = multer({ storage: storage}).fields([{ name: 'coverimage', maxCount: 1 }, { name: 'eventimage', maxCount: 8 }]);
var router = express.Router();

var Event = require('../models/event');
var Dj = require('../models/dj');

router.get('/', ensureAuthenticated, function(req, res, next){

	if(req.user.role == 'vendor'){
		var userid = req.user._id;
		Event.getEventByUserId(userid, function(err, events){
		
					if(err){
							throw err;	
						}
		
							allevents = [];
							events.forEach(function(doc, err){
								allevents.push(doc);
							});
							
							res.render('manageEvent',  {flash: {allevents: allevents, successmsg: req.flash('successmsg'), title: 'Events', role: req.user.role, id: req.user._id}});				
		
				});
	} else{

		Event.getEvent(function(err, events){

			if(err){
					throw err;	
				}

					allevents = [];
					events.forEach(function(doc, err){
						allevents.push(doc);
					});
					
					res.render('manageEvent',  {flash: {allevents: allevents, successmsg: req.flash('successmsg'), title: 'Events', role: req.user.role, id: req.user._id}});				

		});
	}
	
});

router.get('/addEvent', ensureAuthenticated, function(req, res, next){

	Dj.getDj(function(err, djs){
		if(err){
			throw err;	
		}

		alldj = [];
		djs.forEach(function(doc, err){
			alldj.push(doc);
		});
		res.render('addEvent', {event: '', alldj: alldj, flash: { title: 'Add Events', role: req.user.role, id: req.user._id}});
	});
	 
});

router.post('/addEvent', upload, ensureAuthenticated, function(req, res, next){

	var userid = req.body.userid;
	var eventname = req.body.eventname;
	var fromdate = req.body.fromdate;
	var todate = req.body.todate;
	var entryfee = req.body.entryfee;
	var standardtable = req.body.standardtable;
	var premiumtable = req.body.premiumtable;
	var viptable = req.body.viptable;
	var eventdetails = req.body.eventdetails;
	var genres = req.body.genres;
	var dj = req.body.dj;
	console.log(dj);
	var valueofimage = req.files;
	var coverimg = valueofimage.coverimage;
			var str = coverimg[0].destination;
        	var res2 = str.replace("public/", "");
    var coverimage = res2+coverimg[0].filename;
	var eventimg = valueofimage.eventimage;
	var eventimage = [];
		eventimg.forEach(function(doc, err){
			var str = doc.destination;
        	var res1 = str.replace("public/", "");
			eventimage.push(res1+doc.filename);
		});

	var featuredstatus = "false";

	var newEvent = new Event({
		userid : userid,
		eventname : eventname,
		fromdate : fromdate,
		todate : todate,
		coverimage : coverimage,
		eventimage : eventimage,
		entryfee : entryfee,
		standardtable : standardtable,
		premiumtable : premiumtable,
		viptable : viptable,
		eventdetails : eventdetails,
		genres : genres,
		eventdj : dj,
		featuredstatus : featuredstatus
	});

	//console.log(eventimage);
	Event.createEvent(newEvent, function(err, newevent){
		if(err) throw err;
	});

		req.flash('successmsg', 'Event Created Successfully.');

    	res.redirect('/manageEvent');
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
		res.redirect('/manageEvent');
	});
});

router.post('/addEvent/:id', upload, ensureAuthenticated, function(req, res, next){
	
	var id = req.params.id;
	
	var userid = req.body.userid;
	var eventname = req.body.eventname;
	var fromdate = req.body.fromdate;
	var todate = req.body.todate;
	var entryfee = req.body.entryfee;
	var standardtable = req.body.standardtable;
	var premiumtable = req.body.premiumtable;
	var viptable = req.body.viptable;
	var eventdetails = req.body.eventdetails;
	var genres = req.body.genres;
	var dj = req.body.dj;
	var valueofimage = req.files;
	if(valueofimage){
		var coverimg = valueofimage.coverimage;
		if(coverimg){

				var str = coverimg[0].destination;
	        	var res2 = str.replace("public/", "");
	    		var coverimage = res2+coverimg[0].filename;
		} else{
			var coverimage = req.body.oldcoverimage;
		}
		var eventimg = valueofimage.eventimage;
		if(eventimg){
			var eventimage = [];
				eventimg.forEach(function(doc, err){
					var str = doc.destination;
		        	var res1 = str.replace("public/", "");
					eventimage.push(res1+doc.filename);
				});
		} else{
			var eventimage = req.body.oldeventimage;
			eventimage = eventimage.split(",");
		}
	}

	var updEvent = {
		userid : userid,
		eventname : eventname,
		fromdate : fromdate,
		todate : todate,
		coverimage : coverimage,
		eventimage : eventimage,
		entryfee : entryfee,
		standardtable : standardtable,
		premiumtable : premiumtable,
		viptable : viptable,
		eventdetails : eventdetails,
		genres : genres,
		eventdj : dj
	};
	

				Event.updateEvent(id, updEvent, function(err, updEvent){
                    if(err) throw err;
                });
                req.flash('successmsg', 'Your Information is Updated.');

                res.redirect('/manageEvent');

});

router.post('/updpublishstatus/:id', ensureAuthenticated, function(req, res, next){
	var id = req.params.id;
	var publishstatus = req.body.publishstatus;

	
	if(!publishstatus)
	{
		publishstatus = 'false';
	}

	var updEvent = {
		publishstatus : publishstatus
	};
	
	Event.updateFeaturedUser(id, updEvent, function(err, updUser){
			if(err){
				throw err;
			}
	});
            if(publishstatus == 'true')
            {
				req.flash('successmsg', 'This Event is Publish On Live.');
            } else{
                req.flash('successmsg', 'This Event is no longer on Live.');
            }

                res.redirect('/manageEvent');
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