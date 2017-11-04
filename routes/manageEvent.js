var express = require('express');
var multer = require('multer');
var datetime = require('node-datetime');
var moment = require('moment');
var stripe = require('stripe')('sk_test_FPDq3c5K35UlpsZIsoVVPVyZ');
var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'public/images/events/')
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + file.originalname);
    }
});
var upload = multer({ storage: storage}).fields([{ name: 'video', maxCount: 1 }, {name: 'rotateimage', maxCount: 1 }, {name: 'coverimage', maxCount: 1 }, { name: 'eventimage', maxCount: 8 }]);
var router = express.Router();

var Event = require('../models/event');
var Dj = require('../models/dj');
var Plan = require('../models/plan');
var VendorPayment = require('../models/vendorpayment');
var Genres = require('../models/genres');

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

router.get('/manageEventByUser/:userid', ensureAuthenticated, function(req, res){

	var userid = req.params.userid;
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

});
router.get('/getallevent', ensureAuthenticated, function(req, res, next){

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
							
							res.send(allevents);				
		
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

	var id = req.user._id;

	Genres.getGenresByUserId(id, function(err, genress){
		if(err){
			throw err;
		}
		Dj.getDjByUserId(id, function(err, djs){
			if(err){
				throw err;	
			}
				alldj = [];
				djs.forEach(function(doc, err){
					alldj.push(doc);
				});
			res.render('addEvent', { genress: genress, alldj: alldj, flash: { title: 'Add Events', role: req.user.role, id: req.user._id}});
		});
	});
});

/*router.post('/addEvent', upload, ensureAuthenticated, function(req, res, next){

	var userid = req.body.userid;
	var eventname = req.body.eventname;
	var fromdate = req.body.fromdate;
	var todate = req.body.todate;
	var entryfee = req.body.entryfee;
	var eventdetails = req.body.eventdetails;
	var genres = req.body.genres;
	var dj = req.body.dj;

	var stdgusetlimit = req.body.stdgusetlimit;
	var stdtablecount = req.body.stdtablecount;
	var stdtableprice = req.body.stdtableprice;
	var standardtable = {guestlimit : stdgusetlimit, tablecount : stdtablecount, tableprice : stdtableprice};
			
	var pregusetlimit = req.body.pregusetlimit;
	var pretablecount = req.body.pretablecount;
	var pretableprice = req.body.pretableprice;
	var premiumtable = {guestlimit : pregusetlimit, tablecount : pretablecount, tableprice : pretableprice};
			
	var vipgusetlimit = req.body.vipgusetlimit;
	var viptablecount = req.body.viptablecount;
	var viptableprice = req.body.viptableprice;
	var viptable = {guestlimit : vipgusetlimit, tablecount : viptablecount, tableprice : viptableprice};
			
	var valueofimage = req.files;
	var video = valueofimage.video;
			var str = video[0].destination;
        	var res3 = str.replace("public/", "");
    var videos = res3+video[0].filename;
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
	var saveasdraft = req.body.saveasdraft;

	if(saveasdraft){
		draft = 'true';
	} else{
		draft = 'false';
	}

	var newEvent = new Event({
		userid : userid,
		eventname : eventname,
		fromdate : fromdate,
		todate : todate,
		video : videos,
		coverimage : coverimage,
		eventimage : eventimage,
		entryfee : entryfee,
		standardtable : standardtable,
		premiumtable : premiumtable,
		viptable : viptable,
		eventdetails : eventdetails,
		genres : genres,
		eventdj : dj,
		featuredstatus : featuredstatus,
		draft : draft
	});
	console.log(newEvent);
	Event.createEvent(newEvent, function(err, newevent){
		if(err) throw err;
		
	});

		req.flash('successmsg', 'Event Created Successfully.');

    	res.redirect('/manageEvent');
});*/

router.post('/addEvent', ensureAuthenticated, function(req, res, next){

	var userid = req.body.userid;
	var eventname = req.body.eventname;
	var fromdates = req.body.fromdate;
	var fromdate = moment( fromdates, "DD-MM-YYYY h:mm:ss");
	var todates = req.body.todate;
	var todate = moment( todates, "DD-MM-YYYY h:mm:ss");
	var entryfee = req.body.entryfee;
	var eventdetails = req.body.eventdetails;
	var genres = req.body.genres;
	var dresscode = req.body.dresscode;
	var dj = req.body.dj;
	var standardtable = "";
	var premiumtable = "";
	var viptable = "";
    var videos = "";
    var coverimage = "";
	var eventimage = "";
	var featuredstatus = "false";
	var publishstatus = "false";
	var draft = 'true';
	var videolink = "";
	var memberlimit = "";
	var rsvpoffers = "";
	var rotateimage = "";
	var archivedstatus =  "false";

	var newEvent = new Event({
		userid : userid,
		eventname : eventname,
		fromdate : fromdate,
		todate : todate,
		video : videos,
		coverimage : coverimage,
		eventimage : eventimage,
		entryfee : entryfee,
		standardtable : standardtable,
		premiumtable : premiumtable,
		viptable : viptable,
		eventdetails : eventdetails,
		genres : genres,
		dresscode : dresscode,
		eventdj : dj,
		featuredstatus : featuredstatus,
		publishstatus : publishstatus,
		draft : draft,
		videolink : videolink,
		memberlimit : memberlimit,
		rsvpoffers : rsvpoffers,
		rotateimage : rotateimage,
		archivedstatus : archivedstatus
	});
	
	Event.createEvent(newEvent, function(err, newevent){
		if(err) throw err;
		req.flash('successmsg', 'Event Save as Draft Successfully.');

    	res.redirect('/manageEvent/addEvent/'+newevent._id);		
	});

});

router.get('/addEvent/:id',ensureAuthenticated, function(req, res, next){
	
	var id = req.params.id;

	Event.getEventById(id, function(err, event){
		if(err){
			throw err;
		}
		var userid = req.user._id;
		var userrsvp = req.user.purchaseticket[0].rsvp;
		var usertablerequest = req.user.purchaseticket[0].tablerequest;
		var userticket = req.user.purchaseticket[0].ticket;

		Genres.getGenresByUserId(userid, function(err, genress){
			if(err){
				throw err;
			}
			Dj.getDjByUserId(userid, function(err, djs){
				if(err){
					throw err;	
				}
				Plan.getPlan(function(err, plans){
					if(err){
						throw err;
					}
					alldj = [];
					djs.forEach(function(doc, err){
						alldj.push(doc);
					});
				//console.log(event);
					res.render('addEvent', {genress : genress, event: event, alldj: alldj, plans: plans, purchase: { userrsvp: userrsvp, usertablerequest: usertablerequest, userticket: userticket }, flash: { title: 'Edit Events', role: req.user.role, id: req.user._id}});
				});
			});
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

	var saveasdraft1 = req.body.saveasdraft1;
	var saveasdraft2 = req.body.saveasdraft2;
	var saveasdraft3 = req.body.saveasdraft3;
	var crrdate = moment(Date.now()).format('DD-MM-YYYY h:mm:ss');
	
	if(saveasdraft1){
		var eventname = req.body.eventname;
		var fromdates = req.body.fromdate;
		var fromdate = moment( fromdates, "DD-MM-YYYY h:mm:ss");
		var todates = req.body.todate;
		var todate = moment( todates, "DD-MM-YYYY h:mm:ss");
		var entryfee = req.body.entryfee;
		var eventdetails = req.body.eventdetails;
		var genres = req.body.genres;
		var dresscode = req.body.dresscode;
		var dj = req.body.dj;

		if(fromdates > crrdate)
		{
			var updEvent = {
				eventname : eventname,
				fromdate : fromdate,
				todate : todate,
				entryfee : entryfee,
				eventdetails : eventdetails,
				genres : genres,
				dresscode : dresscode,
				eventdj : dj,
				publishstatus : 'true',
				archivedstatus : 'false'
				};
		} else{
			var updEvent = {
				eventname : eventname,
				fromdate : fromdate,
				todate : todate,
				entryfee : entryfee,
				eventdetails : eventdetails,
				genres : genres,
				dresscode : dresscode,
				eventdj : dj,
				publishstatus : 'false',
				archivedstatus : 'true'
			};
		}

	}
	
	if(saveasdraft2){
		var valueofimage = req.files;
		console.log(valueofimage);
		if(valueofimage){
			var video = valueofimage.video;
			if(video){

					var str = video[0].destination;
		        	var res2 = str.replace("public/", "");
		    		var videos = res2+video[0].filename;
			} else{
				var videos = req.body.oldvideo;
			}
			var rotateimg = valueofimage.rotateimage;
			if(rotateimg){

					var str = rotateimg[0].destination;
		        	var res2 = str.replace("public/", "");
		    		var rotateimage = res2+rotateimg[0].filename;
			} else{
				var rotateimage = req.body.oldrotateimage;
			}
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

		var videolink = req.body.videolink;

		var updEvent = {
			video : videos,
			videolink : videolink,
			rotateimage : rotateimage,
			coverimage : coverimage,
			eventimage : eventimage
			};

	} 

	if(saveasdraft3){
		var memberlimit = req.body.memberlimit;
		var rsvpoffers = req.body.rsvpoffers;

		var stdgusetlimit = req.body.stdgusetlimit;
		var stdtablecount = req.body.stdtablecount;
		var stdtableprice = req.body.stdtableprice;
		var standardtable = {guestlimit : stdgusetlimit, tablecount : stdtablecount, tableprice : stdtableprice};
				
		var pregusetlimit = req.body.pregusetlimit;
		var pretablecount = req.body.pretablecount;
		var pretableprice = req.body.pretableprice;
		var premiumtable = {guestlimit : pregusetlimit, tablecount : pretablecount, tableprice : pretableprice};
				
		var vipgusetlimit = req.body.vipgusetlimit;
		var viptablecount = req.body.viptablecount;
		var viptableprice = req.body.viptableprice;
		var viptable = {guestlimit : vipgusetlimit, tablecount : viptablecount, tableprice : viptableprice};

		var updEvent = {
			memberlimit : memberlimit,
			rsvpoffers : rsvpoffers,
			standardtable : standardtable,
			premiumtable : premiumtable,
			viptable : viptable
			};
	}

	//console.log(updEvent);
	
	Event.updateEvent(id, updEvent, function(err, updEvent){
        if(err) throw err;
    });
    req.flash('successmsg', 'Your Information is Updated.');

    res.redirect('/manageEvent/addEvent/'+id);

});

router.get('/updpublishstatus/:id', ensureAuthenticated, function(req, res, next){
	var id = req.params.id;
	var publishstatus = "true";
	var draft = "false";

	var updEvent = {
		draft : draft,
		publishstatus : publishstatus
	};
	
	Event.updateFeaturedUser(id, updEvent, function(err, updUser){
			if(err){
				throw err;
			}
	});

    res.redirect('/manageEvent');
});

router.get('/payment/:id', ensureAuthenticated, function(req, res, next){
	
	var id = req.params.id;

	Plan.getPlan(function(err, plans){

		res.render('payment', {plans: plans, eventid: id, flash: { title: 'Featured Plans', role: req.user.role, id: req.user._id}});
	});

});

router.post('/payment/:id', ensureAuthenticated, function(req, res, next){
	
	var userid = req.user._id;
	var eventid = req.params.id;
	var plantitle = req.body.plantitle;
	var planduration = req.body.planduration;
	
	var dt = datetime.create();
	var plandate = dt.format('d/m/Y');
	
	var planexpiredate = moment().add(planduration, 'months').format("DD/MM/YYYY");

	var planstatus = "Running";

	var token = req.body.stripeToken;
	var chargeAmount = req.body.chargeamount;
	var charge = stripe.charges.create({
		amount: chargeAmount*100,
		currency: 'usd',
		source: token
	}, function(err, charge){
			if(err){
				console.log("Your card was decliend");
			}
	});

	var newVendorPayment = new VendorPayment({
		userid : userid,
		eventid : eventid,
		plantitle : plantitle,
		planprice : chargeAmount,
		plandate : plandate,
		planexpiredate : planexpiredate,
		planstatus : planstatus
	});

	//console.log(newVendorPayment);

	VendorPayment.createVendorPayment(newVendorPayment, function(err, newvendorpayment){
		if(err){
			throw err;
		}
	});

	var featuredstatus = 'true';

	var updEvent = {
		featuredstatus : featuredstatus
	};

	Event.updateFeaturedUser(eventid, updEvent, function(err, updUser){
			if(err){
				throw err;
			}
	});

	req.flash('successmsg', 'Your Payment was Successful.');
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