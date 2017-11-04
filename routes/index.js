
var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var generator = require('generate-password');
var router = express.Router();
var gcm = require('node-gcm');
var webpush = require('web-push');
var moment = require('moment');
var cron = require('node-cron');
var NodeGeocoder = require('node-geocoder');
var nodemailer = require('nodemailer');

var multer = require('multer');
var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'public/images/endusers/')
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + file.originalname);
    }
});
var upload = multer({ storage: storage}).single('file');

// Nodemailer 
var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: 'seo.itradicals@gmail.com',
        pass: 'itradicals1233#'
    }
});

var User = require('../models/user');
var Enduser = require('../models/enduser');
var Event = require('../models/event');
var Dj = require('../models/dj');
var Agreement = require('../models/agreement');
var GuestList = require('../models/guestlist');
var CardList = require('../models/cardlist');
var Review = require('../models/review');
var MerchentPayment = require('../models/merchentpayment');
var ReferralPayment = require('../models/referralpayment');
var Commission = require('../models/commission');
var Messages = require('../models/messages');

cron.schedule('0 10 0 * * *', function(){

    Event.getEventsByDate(function(err, events){
        if(err){
            throw err;
        }
        eventids = [];
        events.forEach(function(doc, err){
            eventids.push(doc._id);
        });

        updEvent = {
            archivedstatus : "true",
            publishstatus : "false"
        };
        Event.updateEvents(eventids, updEvent, function(err, events){
            if(err){
                throw err;
            }
            res.json(events);
        });
    });
});


/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {role: "superadmin", flash: {successmsg: req.flash('successmsg'), errormsg: req.flash('errormsg'), title : 'OnTheList'}});
});

router.get('/vendor', function (req, res) {
    res.render('index', {role: "vendor", flash: {successmsg: req.flash('successmsg'), errormsg: req.flash('errormsg'), title : 'OnTheList'}});
});

router.get('/referral', function (req, res) {
    res.render('index', {role: "referral", flash: {successmsg: req.flash('successmsg'), errormsg: req.flash('errormsg'), title : 'OnTheList'}});
});

// Register
router.get('/register', function(req, res) {
    res.render('register',{flash: {errormsg: req.flash('errormsg')}});
});

router.post('/register', function(req, res) {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var email = req.body.email;
    var password = req.body.password;
    var password2 = req.body.password2;
    var companyname = req.body.companyname;
    var telephone = req.body.telephone;
    var place = req.body.place;
    var street = req.body.street;
    var city = req.body.city;
    var tagline = "";
    var description = "";
    var dresscode = "";
    var music = "";
    var facilities = "";
    var video = "";
    var coverimage = "";
    var venueimage = "";
    var role = "vendor";
    var agreement = "";
    var createddate = moment(Date.now()).format('MM/DD/YYYY');
    var publishablekey = "";
    var secretkey = "";
    var rsvp = "off";
    var tablerequest = "off";
    var ticket = "off";
    var address = street+" "+place+" "+city;

    var purchaseticket = {rsvp : rsvp, tablerequest : tablerequest, ticket : ticket};

    var options = {
          provider: 'google',
         
          // Optional depending on the providers 
          httpAdapter: 'https', // Default 
          apiKey: 'AIzaSyCVZlXZhTe-2o_sx2c9nPWJ2P9wH19aUNI', // for Mapquest, OpenCage, Google Premier 
          formatter: null         // 'gpx', 'string', ... 
        };
         
        var geocoder = NodeGeocoder(options);
         
        // Using callback 
        geocoder.geocode(address)
          .then(function(resp) {
            var latitude = resp[0].latitude;
            var longitude = resp[0].longitude;

            req.checkBody('password2', 'Passwords do not Match').equals(req.body.password);

            var errors = req.validationErrors();

            if(errors){
                res.render('register',{
                    errors: errors
                });
            } else {
                var newUser = new User({
                    firstname: firstname,
                    lastname: lastname,
                    email: email,
                    password: password,
                    companyname: companyname,
                    telephone: telephone,
                    place: place,
                    street: street,
                    city: city,
                    tagline: tagline,
                    description: description,
                    dresscode: dresscode,
                    music: music,
                    facilities: facilities,
                    video: video,
                    coverimage: coverimage,
                    venueimage: venueimage,
                    role: role,
                    agreement: agreement,
                    latitude: latitude,
                    longitude: longitude,
                    createddate: createddate,
                    publishablekey: publishablekey,
                    secretkey: secretkey,
                    purchaseticket: purchaseticket
                });

                User.getUserByEmail(email, function(err, user){
                    if(err){
                        throw err;  
                    } 
                    if(user != null){

                        req.flash('errormsg', 'This Email Id is already exist.');
                        res.redirect('/register');
                    }
                    else{
                        User.createUser(newUser, function(err, newuser){
                            if(err){
                             throw err;
                            }
                            var mailOptions = {
                                from: 'seo.itradicals@gmail.com', // sender address
                                to: 'seo.itradicals@gmail.com', // list of receivers
                                subject: 'New Vendor Register.', // Subject line
                                text: 'FirstName: '+firstname+' LastName: '+lastname+' Email: '+email, // plain text body
                            };

                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {
                                    return console.log(error);
                                }
                                console.log('Message %s sent: %s', info.messageId, info.response);
                            });  
                        });
                        req.flash('successmsg', 'You are Registered and Can now Login');
                        res.redirect('/vendor');      
                    }
                });

                
            }
          })
          .catch(function(err) {
            console.log(err);
          });

});

passport.use(new LocalStrategy({  
    usernameField : 'username',       
    passReqToCallback : true },
  function(req, email, password, done) {
    var role = req.body.role;
    User.getUserByUsername(email, function(err, user){
		if(err) throw err;
		if(!user){
			return done(null, false, {message: 'Unkonwn User'});
		}

		User.comparePassword(password, user.password, function(err, isMatch){
			if(err) throw err;
			if(isMatch && user.agreement != '' && user.role == role){
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

router.get('/loginfail', function(req, res){

    req.flash('errormsg', "Invalid Username & Password or You are not Verified.");

    res.redirect('/');
});

router.get('/agreement', ensureAuthenticated, function(req, res, next){
    var agreementid = req.user.agreement;
    
    Agreement.getAgreementById(agreementid, function(err, agreement){

        res.render('agreement', {agreement: agreement, flash: { title: 'Agreement', userid: req.user._id, errormsg: req.flash('errormsg') }});
    
    });
    
});

router.get('/viewAgreement', ensureAuthenticated, function(req, res, next){
    var agreementid = req.user.agreement;
    
    Agreement.getAgreementById(agreementid, function(err, agreement){

        res.render('viewAgreement', {agreement: agreement, flash: { title: 'Agreement', userid: req.user._id, errormsg: req.flash('errormsg'), role: req.user.role, id: req.user._id }});
    
    });
    
});

router.get('/checkAgreement', ensureAuthenticated, function(req, res){
    
    var verify = req.user.verify;
    var role = req.user.role;
    //console.log(role);
    if(verify == 'false' && role != 'referral'){
        res.redirect('/agreement');
    } else{
        res.redirect('/dashboard');
    }
});

router.post('/updverify/:id', ensureAuthenticated, function(req, res, next){
    var id = req.params.id;
    var endpoint = req.body.endpoint;
    var authSecret = req.body.authSecret;
    var keys = req.body.keys;
    var verify = 'true';

    var updUser = {
        endpoint : endpoint,
        authSecret : authSecret,
        keys : keys,
        verify : verify
    };
    
    User.updateVerifyUser(id, updUser, function(err, updUser){
            if(err){
                throw err;
            }
    });
                
        req.flash('successmsg', 'You are Verified.');

        res.redirect('/dashboard');
});

router.get('/logout', function(req, res){
    var role = req.user.role;

	req.logout();

	req.flash('successmsg', "You are Logout");
    if(role == 'superadmin'){
	   res.redirect('/');
    } else if(role == 'vendor'){
        res.redirect('/vendor');
    } else{
        res.redirect('/referral');
    }
});

// Api login

router.get('/api/getenduser/:email/:password', function(req, res){
	//console.log('Hello Lucifer');
	var email = req.params.email;
	var password = req.params.password;
		Enduser.getUser(email, password, function(err, enduser){
			if(err){
				throw err;	
			} 
			if(enduser != null){

				res.json({success: "true", id:enduser._id, firstname:enduser.firstname, lastname:enduser.lastname, email:enduser.email, role:enduser.role, venueid: enduser.userid});
			}
			else{
				res.json({success: false});	
			}
		});
});

router.get('/api/getenduserbyid/:enduserid', function(req, res){
    //console.log('Hello Lucifer');
    var enduserid = req.params.enduserid;
        Enduser.getEndUserById(enduserid, function(err, enduser){
            if(err){
                throw err;  
            }
            if(enduser != null){
                var enduser = JSON.parse(JSON.stringify(enduser));
                delete enduser.password;
                res.json(enduser);
            }
            else{
                res.json({message: 'Invalid EndUser Id'}); 
            }
        });
});

router.get('/api/setenduser/:firstname/:lastname/:email/:password/:dob/:deviceid', function(req, res){
    var userid = "";
	var firstname = req.params.firstname;
	var lastname = req.params.lastname;
	var email = req.params.email;
	var password = req.params.password;
	var dob = req.params.dob;
    var deviceid = req.params.deviceid;
    var city = "";
    var state = "";
    var profileimage = "";
    var role = "enduser";

		var newEndUser = new Enduser({
            userid: userid,
    		firstname: firstname,
    		lastname: lastname,
    		email: email,
    		password: password,
    		dob: dob,
            deviceid: deviceid,
            city: city,
            state: state,
            profileimage: profileimage,
            role: role
    	});

		Enduser.getEmail(email, function(err, enduser){
			if(err){
				throw err;	
			} 
			if(enduser != null){

				res.json({message: "already exist"});
			}
			else{
				Enduser.createEndUser(newEndUser, function(err, user){
	    		if(err){ 
	    			throw err;
	    		}else {
                        var mailOptions = {
                            from: 'seo.itradicals@gmail.com', // sender address
                            to: 'seo.itradicals@gmail.com', // list of receivers
                            subject: 'New EndUser Register.', // Subject line
                            text: 'FirstName: '+firstname+' LastName: '+lastname+' Email: '+email, // plain text body
                        };

                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                return console.log(error);
                            }
                            console.log('Message %s sent: %s', info.messageId, info.response);
                        });
    				res.json({message: "success", firstname: user.firstname, lastname: user.lastname, email: user.email, enduserid: user._id });
    			}
    			});		
			}
		});
});

router.get('/api/updenduser/:enduserid/:firstname/:lastname/:dob/:city/:state', function(req, res, next){

    var enduserid = req.params.enduserid;
    var firstname = req.params.firstname;
    var lastname = req.params.lastname;
    var dob = req.params.dob;
    var city = req.params.city;
    var state = req.params.state;

    var updEnduser = {
        firstname: firstname,
        lastname: lastname,
        dob: dob,
        city: city,
        state: state
    };

    Enduser.updEnduser(enduserid, updEnduser, function(err, enduser){
        if(err){
            throw err;
        }
        res.json({ message : 'Successfuly Update.'});
    });
});

router.get('/api/setfbuser/:firstname/:lastname/:email', function(req, res){
	var firstname = req.params.firstname;
	var lastname = req.params.lastname;
	var email = req.params.email;
	var password = generator.generate({
	    length: 8,
	    numbers: true
	});

		var newEndUser = new Enduser({
    		firstname: firstname,
    		lastname: lastname,
    		email: email,
    		password: password
    	});

		Enduser.getEmail(email, function(err, enduser){
			if(err){
				throw err;	
			} 
			if(enduser != null){

				res.json({status:1, message: "already exist", newEndUser});
			}
			else{
				Enduser.createEndUser(newEndUser, function(err, user){
	    		if(err){ 
	    			throw err;
	    		}else {
    				res.json({status:1, message: "success", newEndUser});
    			}
    			});		
			}
		});
});

router.get('/api/getoldpassword/:enduserid', function(req, res, next){

    var enduserid = req.params.enduserid;

    Enduser.getEndUserById(enduserid, function(err, enduser){
        if(err){
            throw err;
        }
        res.json({ oldpassword : enduser.password });
    });

});

router.get('/api/setnewpassword/:enduserid/:newpassword', function(req, res, next){

    var enduserid = req.params.enduserid;
    var newpassword = req.params.newpassword;

    var updEnduser = {
        password : newpassword
    };

    Enduser.updEnduser(enduserid, updEnduser, function(err, enduser){
        if(err){
            throw err;
        }
        res.json({ message : "Success" });
    });

});

router.get('/api/forgetpassword/:enduserid/:email', function(req, res){

    var enduserid = req.params.enduserid;
    var email = req.params.email;

    Enduser.getEndUserById(enduserid, function(err, enduser){
        if(err){
            throw err;
        }
        var mailOptions = {
                from: 'OnTheList', // sender address
                to: email, // list of receivers
                subject: 'Forget Password.', // Subject line
                text: 'Username: '+enduser.email+' Password: '+enduser.password, // plain text body
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message %s sent: %s', info.messageId, info.response);
                res.json({ message: 'Success'});
            });
    });
});

router.post('/api/enduserprofileimage/:id', function(req, res){
   
    var enduserid = req.params.id;
   
    upload(req, res, function(err) {
        if(err) {
            res.json(err);
        }
        var tempPath = req.file.path;
        var path = tempPath.replace('public/', '');
        
        var updEnduser = {
            profileimage : path
        };
    
        Enduser.updEnduser(enduserid, updEnduser, function(err, enduser){
            if(err){
                throw err;
            }
            res.json({ message : "Success" });
        });
    });
    
});

router.get('/api/getfeaturedevent', function(req, res){

    var featuredstatus = "true";

    Event.getFstatusEvent(featuredstatus, function(err, events){

            if(err){
                    throw err;  
                }

                    allevents = [];
                    events.forEach(function(doc, err){
                        allevents.push(doc);
                    });
                    
                    res.json(allevents);               

    });
});

router.get('/api/getevents', function(req, res){

    Event.getEvent(function(err, events){

            if(err){
                    throw err;  
                }

                    allevents = [];
                    events.forEach(function(doc, err){
                        allevents.push(doc);
                    });
                    
                    res.json(allevents);               

    });
});

router.get('/api/getclub', function(req, res){
    
    User.getUserByVendor(function(err, users){
            if(err){
                throw err;  
            } 

                allusers = [];
                users.forEach(function(doc, err){
                    allusers.push(doc);
                });
                res.json(allusers);
                
    });
  //res.render('vendorList', {title: 'Vendor List'});
});

router.get('/api/getclub/:venueid', function(req, res){
    
    var id = req.params.venueid;
    User.getUserById(id, function(err, user){
            if(err){
                throw err;  
            } 
           var user = JSON.parse(JSON.stringify(user));
           delete user.firstname;
           delete user.lastname;
           delete user.email;
           delete user.password;
           delete user.agreement;
            res.json(user);
                
    });
  //res.render('vendorList', {title: 'Vendor List'});
});

router.get('/api/getdjs', function(req, res){

    Dj.getDj(function(err, djs){

            if(err){
                    throw err;  
                }

                    alldj = [];
                    djs.forEach(function(doc, err){
                        alldj.push(doc);
                    });
                    
                    res.json(alldj);               

    });
});

router.get('/api/getdjevent/:djid', function(req, res){

    var id = req.params.djid;
    Event.getDjEvent(id, function(err, djs){

        if(err){
            throw err;  
        }

        allevent = [];
        djs.forEach(function(doc, err){
            allevent.push(doc);
        });
            

        Dj.getDjById(id, function(err, dj){
            if(err){
                throw err;
            }


            res.json({allevent, dj});
        });             

    });
});

router.get('/api/getvenueevent/:venueid', function(req, res){

    var id = req.params.venueid;
    Event.getEventByUserId(id, function(err, events){

        if(err){
            throw err;  
        }

        allevent = [];
        events.forEach(function(doc, err){
            allevent.push(doc);
        });
            

        User.getUserById(id, function(err, user){
            if(err){
                throw err;
            }

            var venueid = user._id;
            var venuename = user.companyname;
            var place = user.place;
            var city = user.city;
            
            res.json({ allevent, venuedetail : {venuid: venueid, venuename: venuename, place: place, city: city }});
        });             

    });
});

router.get('/api/geteventdetails/:eventid', function(req, res){

    var id = req.params.eventid;
    Event.getEventById(id, function(err, event){

        if(err){
            throw err;  
        }
            
        var userid = event.userid;

        User.getUserById(userid, function(err, user){
            if(err){
                throw err;
            }
           
            var companyname = user.companyname;
            
            var str = event.eventdj;

        Dj.getDjByIds(str, function(err, djs){

            res.json({event, companyname : companyname, djs});

        });
        });             

    });
});


router.get('/api/getsearchlocation/:keywrd', function(req, res){

    var keywrd = req.params.keywrd;
    User.getUserByLocation(keywrd, function(err, users){

        if(err){
            throw err;  
        }
        console.log(users);
        res.json(users);             

    });
});

router.get('/api/getpublishablekey', function(req, res){

    var role = 'superadmin';

    User.getUserByRole(role, function(err, user){
        if(err){
            throw err;
        }
        res.json(user.publishablekey);
    });
});

router.get('/api/enduserpayment/:stripetoken/:amount', function(req, res){

    var role = 'superadmin';
    var token = req.params.stripetoken;
    var amount = req.params.amount;

    User.getUserByRole(role, function(err, user){
        if(err){
            throw err;
        }

        var stripe = require('stripe')(user.secretkey);
  
        var charge = stripe.charges.create({
            amount: amount*100,
            currency: 'usd',
            source: token
            }, function(err, charge){
                if(err){
                  console.log(err);
                }
        });
        res.json({message : 'Success'})
    });

});

router.get('/api/gettabledetails/:eventid', function(req, res){

    var eventid = req.params.eventid;
    Event.getTabledetailsById(eventid, function(err, tabledetail){

        if(err){
            throw err;  
        }
        //console.log(tabledetail);
        res.json( { eventid : tabledetail._id, standardtable : tabledetail.standardtable, premiumtable : tabledetail.premiumtable, viptable : tabledetail.viptable, eventdate : tabledetail.fromdate });             

    });
});

router.get('/api/sendtablerequest/:venueid/:enduserid/:eventid/:eventdate/:bookingdate/:bookingreference/:tabletype/:tableprice', function(req, res){

    var venueid = req.params.venueid;
    var eventid = req.params.eventid;
    var eventdate = req.params.eventdate;
    var bookingdate = req.params.bookingdate;
    var enduserid = req.params.enduserid;
    var bookingreference = req.params.bookingreference;
    var qrcode = "";
    var tabletype = req.params.tabletype;
    var tableprice = req.params.tableprice;
    var totalprice = "";
    var requesttable = "";
    var status = "Request Pending";
    var rsvpstatus = "false";
    var checkin = "";

    var newUser = new GuestList({
        venueid : venueid,
        enduserid : enduserid,
        eventid : eventid,
        eventdate : eventdate,
        bookingdate : bookingdate,
        bookingreference : bookingreference,
        qrcode : qrcode,
        tabletype : tabletype,
        tableprice : tableprice,
        totalprice : totalprice,
        requesttable : requesttable,
        status : status,
        rsvpstatus : rsvpstatus,
        checkin : checkin
    });

    GuestList.setNewUser(newUser, function(err, tabledetail){

        if(err){
            throw err;  
        }
        //console.log(tabledetail);
        res.json(newUser);             

    });
});

router.get('/api/updguestlist/:guestlistid/:qrcode/:totalprice', function(req, res){

    var guestlistid = req.params.guestlistid;
    var qrcode = req.params.qrcode;
    var totalprice = req.params.totalprice;
    var status = "Pending";

    var updUser = {
        qrcode : qrcode,
        totalprice : totalprice,
        status : status
    };

    GuestList.updateUser( guestlistid, updUser, function(err, tabledetail){

        if(err){
            throw err;  
        }
        //console.log(tabledetail);
        res.json({ message : "success" });             

    });
});



router.get('/api/setguestlist/:venueid/:enduserid/:eventid/:eventdate/:bookingreference/:qrcode/:tabletype/:tableprice/:totalprice/:rsvpstatus/:paymentid', function(req, res){

    var venueid = req.params.venueid;
    var enduserid = req.params.enduserid;
    var eventid = req.params.eventid;
    var eventdate = req.params.eventdate;
    var bookingdate = moment(Date.now()).format('MM/DD/YYYY HH:mm:ss');
    var bookingreference = req.params.bookingreference;
    var qrcode = req.params.qrcode;
    var tabletype = req.params.tabletype;
    var tableprice = req.params.tableprice;
    var totalprice = req.params.totalprice;
    var paymentid = req.params.paymentid;
    var status = "Pending";
    var rsvpstatus = req.params.rsvp;
    var checkin = "";
    var debit = "-";
    var refdebit = "-";

    var newUser = new GuestList({
        venueid : venueid,
        enduserid : enduserid,
        eventid : eventid,
        bookingdate : bookingdate,
        bookingreference : bookingreference,
        qrcode : qrcode,
        tabletype : tabletype,
        tableprice : tableprice,
        totalprice : totalprice,
        status : status,
        rsvpstatus : rsvpstatus,
        checkin : checkin
    });

    GuestList.setNewUser(newUser, function(err, tabledetail){

        if(err){
            throw err;  
        }

        Commission.getCommissionByVenueId(venueid, tabletype, function(err, commission){
            if(err){
                throw err;
            }
            var referralid = commission.userid.referral; 
            //console.log(referralid);
                if(commission.commissiontype == 'Fixed'){
                    var commissionprice = commission.commissionprice;
                } else{
                    var commissionprice = commission.commissionprice*totalprice/100;
                }

                if(referralid != ''){
                    Commission.getCommissionByVenueId(referralid, tabletype, function(err, refcommission){
                        if(err){
                            throw err;
                        }
                            if(refcommission.commissiontype == 'Fixed'){
                                var refcommissionprice = refcommission.commissionprice;
                            } else{
                                var refcommissionprice = refcommission.commissionprice*totalprice/100;
                            }

                        var newPayment = new MerchentPayment({
                            venueid : venueid,
                            enduserid : enduserid,
                            eventid : eventid,
                            referralid : referralid,
                            dates : bookingdate,
                            credit : totalprice,
                            debit : debit,
                            paymentid : paymentid,
                            commissionprice : commissionprice,
                            refcommissionprice : refcommissionprice,
                            refdebit : refdebit
                        });

                        MerchentPayment.createMerchantPayment(newPayment, function(err, payment){
                            if(err){
                                throw err;
                            }
                            res.json(payment);
                        });
                    });
                } else{
                    var newPayment = new MerchentPayment({
                            venueid : venueid,
                            enduserid : enduserid,
                            eventid : eventid,
                            referralid : "",
                            dates : bookingdate,
                            credit : totalprice,
                            debit : debit,
                            paymentid : paymentid,
                            commissionprice : commissionprice,
                            refcommissionprice : "",
                            refdebit : refdebit
                        });

                        MerchentPayment.createMerchantPayment(newPayment, function(err, payment){
                            if(err){
                                throw err;
                            }
                            res.json(newUser);
                        });
                }
        });            

    });
});

router.get('/api/setusercard/:enduserid/:cardname/:cardno/:cvvcode/:expiredate', function(req, res){

    var enduserid = req.params.enduserid;
    var cardname = req.params.cardname;
    var cardno = req.params.cardno;
    var cvvcode = req.params.cvvcode;
    var expiredate = req.params.expiredate;

    var newCard = new CardList({
        enduserid : enduserid,
        cardname : cardname,
        cardno : cardno,
        cvvcode : cvvcode,
        expiredate : expiredate
    });

    CardList.getendusercardsByCardno(cardno, function(err, endusercards){
        if(err){
            throw err;
        }
        if(endusercards != null){
            res.json({ message: "This Card is already Exist.", status: "false"});
        } else{
                CardList.setNewCard(newCard, function(err, newcard){

                    if(err){
                        throw err;  
                    }
                    
                    res.json(newcard);             

                });
        }
    });
});

router.get('/api/getusercard/:enduserid', function(req, res){

    var enduserid = req.params.enduserid;
    CardList.getendusercardsById(enduserid, function(err, endusercards){

        if(err){
            throw err;  
        }
        //console.log(tabledetail);
        res.json(endusercards);             

    });
});

router.get('/api/setreviewrating/:enduserid/:userid/:rating/:comment', function(req, res, next){

    var enduserid = req.params.enduserid;
    var userid = req.params.userid;
    var rating = req.params.rating;
    var comment = req.params.comment;
    var createddate = moment(Date.now()).format('MM/DD/YYYY HH:mm:ss');
    if(comment == 'null')
    {
        comment = "";
    }

        var newReview = new Review({
            enduserid : enduserid,
            userid : userid,
            rating : rating,
            comments : comment,
            createddate : createddate
        });

        Review.addReviewRating(newReview, function(err, newreview){
            if(err){
                throw err;
            }

            res.json(newreview);
        });
});

router.get('/api/getreviewrating/:venueid', function(req, res, next){

    var venueid = req.params.venueid;

        Review.getReviewRating(venueid, function(err, reviews){
            if(err){
                throw err;
            }

            res.json(reviews);
        });
});

router.get('/pushnotifications', function(req, res, next){

    var sender = new gcm.Sender('AIzaSyAlaDD-ak7bLzpOqCQ3fgJ3bIw2NZ0g99c');
 
        var message = new gcm.Message();
     
        message.addNotification({
          title: 'Hello Mr Lucifer',
          body: 'You are Great!!!!',
          icon: 'ic_launcher'
        });
     
        var regTokens = ['eXe1A-BHHRw:APA91bHAWsKN6zJmVFMqXjrxQJ0xLgaH7EIL0WHRDMVX7DHACX6a8gIpfAVLYk_LgLnIVc7xxgrhC_U1MUjfMNhgXPiUD6l8bwMeYuk-OjWiltbqD2N4AlozjBhaMCWWOE4PMyFXZffH'];
     
     
        sender.send(message, { registrationTokens: regTokens }, function (err, response) {
            if (err){
                res.json(err);
            } else{
            res.json(response);
            }
        });
});

/*router.get('/maps', function(req, res, next){
    var options = {
          provider: 'google',
         
           
          httpAdapter: 'https', 
          apiKey: 'AIzaSyCVZlXZhTe-2o_sx2c9nPWJ2P9wH19aUNI', 
          formatter: null        
        };
         
        var geocoder = NodeGeocoder(options);
         
        
        geocoder.geocode('2nd B Road Sardarpura Jodhpur')
  .then(function(res) {
    console.log(res);
  })
  .catch(function(err) {
    console.log(err);
  });
         
});*/

router.get('/notify/:id', function(req, res, next){
    
    var id = req.params.id;
    
    User.getUserById(id, function(err, user){
            if(err){
                throw err;  
            }
            const vapidKeys = webpush.generateVAPIDKeys();

                const pushSubscriptions = {
                    endpoint: user.endpoint,
                    keys: {
                        p256dh: user.keys,
                        auth: user.authSecret
                    }
                },
                payload = '',
                options = {
                    vapidDetails: {
                        subject: 'mailto:seo.itradicals@gmail.com',
                        publicKey: vapidKeys.publicKey,
                        privateKey: vapidKeys.privateKey
                    }
                };

                webpush.setGCMAPIKey('AIzaSyCDZKVg_UxLkRL8_GtmYejBDo8-wJOtv50');
                webpush.sendNotification(
                    pushSubscriptions,
                    payload,
                    options
                );
        });
    //console.log(user.endpoint);
  
});

router.get('/api/todayguestlist/:venueid', function(req, res, next){

    var venueid = req.params.venueid;
    //var dates = moment(Date.now()).format('MM/DD/YYYY');
    Event.getEventByDate(venueid, function(err, event){
        if(err){
            throw err;
        }
        if(event){
            GuestList.getGuestListByUserEventId(venueid, event._id, function(err, guestlists){
                if(err){
                    throw err;
                }
                User.getUserById(venueid, function(err, user){
                    if(guestlists != ''){
                        res.json({guestlists, eventname: event.eventname, eventfromdate: event.fromdate, eventtodate: event.todate, venuename: user.companyname});
                    } else{
                        res.json({ message : "Guest List is Empty."});
                    }
                });
            });
        } else{
            res.json({ message : "Today Not any Event." });
        }

    });
});

router.get('/api/updsccaned/:guestlistid/:status/:checkin', function(req, res, next){

    var guestlistid = req.params.guestlistid;
    var status = req.params.status;
    var checkin = req.params.checkin;

    var updGuest = {
        status : status,
        checkin : checkin
    };
    GuestList.updsccaned(guestlistid, updGuest, function(err, guest){
        if(err){
            throw err;
        }
        res.json({ message : "Success"});
    });

});

/*router.get('/tests', function(req, res, next){
    Event.getEventsByDate(function(err, events){
        if(err){
            throw err;
        }
        eventids = [];
        events.forEach(function(doc, err){
            eventids.push(doc._id);
        });

        updEvent = {
            archivedstatus : "ture"
        };
        Event.updateEvents(eventids, updEvent, function(err, events){
            if(err){
                throw err;
            }
            res.json(events);
        });
    });
});*/

router.get('/api/getpurchasedevent/:enduserid', function(req, res, next){

    var enduserid = req.params.enduserid;

    GuestList.getGuestListByEnduserId(enduserid, function(err, enduser){
        if(err){
            throw err;
        }

        var currentendusers = [];
        var attendendusers = [];
        enduser.forEach(function(doc, err){
            if(doc.eventid.archivedstatus == 'false'){
                currentendusers.push(doc);
            } else{
                attendendusers.push(doc);
            }
        });
         res.json({currentendusers : currentendusers, attendendusers : attendendusers});
    });

});

//Enduser Payment successfull
/*router.get('/api/merchantreport/:venueid/:enduserid/:eventid/:totalprice/:paymentid', function(req, res, next){

    var venueid = req.params.venueid;
    var enduserid = req.params.enduserid;
    var eventid = req.params.eventid;
    var credit = req.params.totalprice;
    var paymentid = req.params.paymentid;
    var dates = moment(Date.now()).format('DD-MM-YYYY HH:mm:ss');
    var debit = "-";
    var refdebit = "-";

    Commission.getCommissionByVenueId(venueid, function(err, commission){
        if(err){
            throw err;
        }
        var referralid = commission.userid.referral; 
        console.log(referralid);
            if(commission.commissiontype == 'Fixed'){
                var commissionprice = commission.commissionprice;
            } else{
                var commissionprice = commission.commissionprice*credit/100;
            }

            if(referralid != ''){
                Commission.getCommissionByVenueId(referralid, function(err, refcommission){
                    if(err){
                        throw err;
                    }
                        if(refcommission.commissiontype == 'Fixed'){
                            var refcommissionprice = refcommission.commissionprice;
                        } else{
                            var refcommissionprice = refcommission.commissionprice*credit/100;
                        }

                    var newPayment = new MerchentPayment({
                        venueid : venueid,
                        enduserid : enduserid,
                        eventid : eventid,
                        referralid : referralid,
                        dates : dates,
                        credit : credit,
                        debit : debit,
                        paymentid : paymentid,
                        commissionprice : commissionprice,
                        refcommissionprice : refcommissionprice,
                        refdebit : refdebit
                    });

                    MerchentPayment.createMerchantPayment(newPayment, function(err, payment){
                        if(err){
                            throw err;
                        }
                        res.json(payment);
                    });
                });
            } else{
                var newPayment = new MerchentPayment({
                        venueid : venueid,
                        enduserid : enduserid,
                        eventid : eventid,
                        referralid : "",
                        dates : dates,
                        credit : credit,
                        debit : debit,
                        paymentid : paymentid,
                        commissionprice : commissionprice,
                        refcommissionprice : "",
                        refdebit : refdebit
                    });

                    MerchentPayment.createMerchantPayment(newPayment, function(err, payment){
                        if(err){
                            throw err;
                        }
                        res.json(payment);
                    });
            }
    });
});*/

router.get('/api/sendmessage/:senderid/:reciverid/:message', function(req, res){

    var senderenduser = req.params.senderid;
    var reciverid = req.params.reciverid;
    var senderrole = 'enduser';
    var reciverrole = 'vendor';
    var message = req.params.message;
    var createddate = moment(Date.now()).format('DD-MM-YYYY HH:mm:ss');

    var newMessage = new Messages({
      senderenduser : senderenduser,
      reciverid : reciverid,
      senderrole : senderrole,
      reciverrole : reciverrole,
      message : message,
      createddate : createddate
    });

    Messages.createMessage(newMessage, function(err, message){
    if(err){
      throw err;
    }
    res.json(message);
  });

});

router.get('/api/getinbox/:enduserid', function(req, res){

    var enduserid = req.params.enduserid;

    Messages.getEnduserInbox(enduserid, function(err, messages){
        if(err){
            throw err;
        }
        res.json(messages);
    });

});

router.get('/api/getsent/:enduserid', function(req, res){

    var enduserid = req.params.enduserid;

    Messages.getEnduserSent(enduserid, function(err, messages){
        if(err){
            throw err;
        }
        res.json(messages);
    });

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
