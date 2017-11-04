var express = require('express');
var generator = require('generate-password');
var nodemailer = require('nodemailer');
var NodeGeocoder = require('node-geocoder');
var moment = require('moment');
/*var smtptransport = require('nodemailer-smtp-transport');*
var sendmail = require('sendmail')();
var helper = require('sendgrid').mail;
var sendgrid = require('sendgrid')('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');*/
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'public/images/vendors/')
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + file.originalname);
    }
});
var upload = multer({ storage: storage}).fields([{ name: 'video', maxCount: 1 }, {name: 'coverimage', maxCount: 1 }, { name: 'venueimage', maxCount: 8 }]);
var router = express.Router();

// Models Included
var User = require('../models/user');
var Agreement = require('../models/agreement');
var Currency = require('../models/currency');
var Event = require('../models/event');
var Genres = require("../models/genres");
var Reviews = require("../models/review");

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


/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
	
	User.getUserByVendor(function(err, users){
		if(err){
			throw err;	
		} 

		allusers = [];
		users.forEach(function(doc, err){
			allusers.push(doc);
		});

		res.render('manageVendor', { flash: {allusers: allusers, title: 'Vendor', role: req.user.role, id: req.user._id, successmsg: req.flash('successmsg'), errormsg: req.flash('errormsg'), successdel: req.flash('successdel')}});

    });
  //res.render('vendorList', {title: 'Vendor List'});
});

router.get('/addVendor', ensureAuthenticated, function(req, res, next){
    Agreement.getAgreement(function(err, agreemnets){
        if(err){
            throw err;
        }
        Currency.getCurrencies(function(err, currencies){
            if(err){
                throw err;
            }  
            allagreement = [];
            agreemnets.forEach(function(doc, err){
                allagreement.push(doc);
            });
        res.render('addVendor',  {allagreement: allagreement, currencies : currencies, flash: { title: 'Add Vendor', role: req.user.role, id: req.user._id}});
        });    
    });
});

router.post('/addVendor', ensureAuthenticated, function(req, res){

	var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var email = req.body.email;
    var password = req.body.password;
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
    var verify = "false";
    var agreement = req.body.agreement;
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
                    verify : verify,
                    agreement: agreement,
                    latitude: latitude,
                    longitude: longitude,
                    endpoint: "",
                    authSecret: "",
                    keys: "",
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

                        res.redirect('/manageVendor');
                    }
                    else{
                        User.createUser(newUser, function(err, newuser){
                            if(err) throw err;
                        });

                        

                        var mailOptions = {
                            from: 'seo.itradicals@gmail.com', // sender address
                            to: email, // list of receivers
                            subject: 'Vendor Profile Details.', // Subject line
                            text: 'Username: '+email+' Password: '+password, // plain text body
                        };

                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                return console.log(error);
                            }
                            console.log('Message %s sent: %s', info.messageId, info.response);
                        });

                        req.flash('successmsg', 'User Successfully Added.');

                        res.redirect('/manageVendor');      
                    }
                });

                
            }
          })
          .catch(function(err) {
            console.log(err);
          });

});

router.get('/editVendor/:id', ensureAuthenticated, function(req, res, next){
	
	var id = req.params.id;
    User.getUserById(id, function(err, user) {
			if(err){
				throw err;	
			}
            Genres.getGenres(function(err, genress){
                if(err){
                    throw err;
                }

                User.getUserByReferral(function(err, referral){
                    if(err){
                        throw err;  
                    } 

                    referrals = [];
                    referral.forEach(function(doc, err){
                        referrals.push(doc);
                    });
                    Reviews.getReviewRating(id, function(err, reviews){
                        if(err){
                            throw err;
                        }
                        var ratings = [];
                        reviews.forEach(function(doc, err){
                            ratings.push(doc.rating);
                        });
                        var totalrating = 0;
                        for(var i=0; i<ratings.length; i++)
                        {
                            totalrating += parseFloat(ratings[i]);
                        }
                        var result = totalrating/ratings.length;
                        var avgrating = parseFloat(Math.round(result * 100) / 100).toFixed(2);
                        var avgrating = avgrating.replace('.00','');
            			if(user != null){
                            console.log(reviews);
            				res.render('userProfile', { referrals : referrals, singleuser: user, genress: genress, reviews : reviews, avgrating : avgrating, title: 'Profile', flash: {successmsg: req.flash('successmsg'), errormsg: req.flash('errormsg'), role: req.user.role, id: req.user._id}});
            			}
                    });
                });
            });
  	});
	
});

router.post('/editVendor/:id', ensureAuthenticated, function(req, res, next){

	var id = req.params.id;
	var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var email = req.body.email;
    var companyname = req.body.companyname;
    var telephone = req.body.telephone;
    var place = req.body.place;
    var street = req.body.street;
    var city = req.body.city;
    var address = street+" "+place+" "+city;

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
          .then(function(res) {
            var latitude = res[0].latitude;
            var longitude = res[0].longitude;
            var updUser = {
                firstname: firstname,
                lastname: lastname,
                email: email,
                companyname: companyname,
                telephone: telephone,
                place: place,
                street: street,
                city: city,
                latitude: latitude,
                longitude: longitude
            };
            User.updateUser(id, updUser, function(err, updUser){
                    if(err) throw err;
                    //res.redirect('/userProfile/'+id);
            });
          })
          .catch(function(err) {
            console.log(err);
          });

    			req.flash('successmsg', 'Your Information is Updated.');

    			res.redirect('/manageVendor/editVendor/'+id);

});

router.post('/usercominfo/:id', upload, ensureAuthenticated, function(req, res, next){

    var id = req.params.id;
    var tagline = req.body.tagline;
    var description = req.body.description;
    var dresscode = req.body.dresscode;
    var genres = req.body.genres;
    var facilities = req.body.facilities;
    var valueofimage = req.files;
    if(valueofimage){
        var video = valueofimage.video;
        if(video){

                var str = video[0].destination;
                var res2 = str.replace("public/", "");
                var videos = res2+video[0].filename;
        } else{
            var videos = req.body.oldvideo;
        }
        var coverimg = valueofimage.coverimage;
        if(coverimg){

                var str = coverimg[0].destination;
                var res2 = str.replace("public/", "");
                var coverimage = res2+coverimg[0].filename;
        } else{
            var coverimage = req.body.oldcoverimage;
        }
        var venueimg = valueofimage.venueimage;
        if(venueimg){
            var venueimage = [];
                venueimg.forEach(function(doc, err){
                    var str = doc.destination;
                    var res1 = str.replace("public/", "");
                    venueimage.push(res1+doc.filename);
                });
        } else{
            var venueimage = req.body.oldvenueimage;
            venueimage = venueimage.split(",");
        }
    }

    var updUser = {
            tagline: tagline,
            description: description,
            dresscode: dresscode,
            genres: genres,
            facilities: facilities,
            video : videos,
            coverimage : coverimage,
            venueimage : venueimage
        };

    User.updateUser(id, updUser, function(err, updUser){
                    if(err) throw err;
                    
                });
                req.flash('successmsg', 'Your Information is Updated.');

                res.redirect('/manageVendor/editVendor/'+id);

});

router.post('/accountSetting/:venueid', function(req, res, next){

    var venueid = req.params.venueid;
    var publishablekey = req.body.publishablekey;
    var secretkey = req.body.secretkey;

    var updAccount = {
        publishablekey : publishablekey,
        secretkey : secretkey
    };

    User.updateUser(venueid, updAccount, function(err, upduser){
        if(err){
            throw err;
        }
    });

    req.flash('successmsg', 'Your Information is Updated.');

                res.redirect('/manageVendor/editVendor/'+venueid);

});

router.post('/referralSetting/:venueid', function(req, res, next){

    var venueid = req.params.venueid;
    var referral = req.body.referral;

    var updAccount = {
        referral : referral
    };

    User.updateUser(venueid, updAccount, function(err, upduser){
        if(err){
            throw err;
        }
    });

    req.flash('successmsg', 'Your Information is Updated.');

                res.redirect('/manageVendor/editVendor/'+venueid);

});

router.get('/delVendor/:id', ensureAuthenticated, function(req, res, next){
	var id = req.params.id;

	User.delUserById(id, function(err, user){
		if(err){
			throw err;
		}
		req. flash('successdel', 'User Successfully Deleted.');
		res.redirect('/manageVendor');
	});
});

router.post('/updverify/:id', ensureAuthenticated, function(req, res, next){
	var id = req.params.id;
	var verify = req.body.verify;

	
	if(!verify)
	{
		verify = 'false';
	}

	var updUser = {
		verify : verify
	};
	
	User.updateVerifyUser(id, updUser, function(err, updUser){
			if(err){
				throw err;
			}
	});
            if(verify == 'true')
            {
				req.flash('successmsg', 'This User is Verified.');
            } else{
                req.flash('successmsg', 'This User is UnVerified.');
            }

                res.redirect('/manageVendor');
});

router.get('/setAgreement/:id', ensureAuthenticated, function(req, res, next){
    var id = req.params.id;

    Agreement.getAgreement(function(err, agreements){
        if(err){
            throw err;
        }

        Currency.getCurrencies(function(err, currencies){
            if(err){
                throw err;
            }

            User.getUserById(id, function(err, user){
                if(err){
                    throw err;
                }
                allagreement = [];
                agreements.forEach(function(doc, err){
                    allagreement.push(doc);
                });
                //console.log(user);
                res.render('setAgreement', {allagreement: allagreement, currencies : currencies, user : user, flash: { title: 'Set Agreement', id: id, role: req.user.role, id: req.user._id}});
            });
        });
    });
});

router.post('/setAgreement/:id', ensureAuthenticated, function(req, res, next){
    var id = req.params.id;

   
    var agreement = req.body.agreement;
    var currency = req.body.currency;

    var setAgreement = {
        agreement : agreement,
        currency : currency
    };

    User.updateUser(id, setAgreement, function(err, agreement){
        if(err){
            throw err;
        }

        req.flash('successmsg', 'This User Information Updated.');
        res.redirect('/manageVendor');
    });
});

router.post('/changePassword', function(req, res, next){
    //console.log("hell");
    var oldpass = req.body.oldpass;
    var newpass = req.body.newpass;
    var userid = req.user._id;
    var userpass = req.user.password;

    User.comparePassword(oldpass, userpass, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
            var updPass = {
                password: newpass,
            };

            User.updatePassword(userid, updPass, function(err, updUser){
                if(err) throw err;
                            //res.redirect('/userProfile/'+id);
            });
                req.flash('successmsg', 'Your Password Successfully Changed.');

                res.redirect('/manageVendor/editVendor/'+userid);


        } else {
            req.flash('errormsg', 'Your Old Password is not Matched.');

            res.redirect('/manageVendor/editVendor/'+userid);
        }
    });
});

router.post('/purchasticket/:id', ensureAuthenticated, function(req, res, next){
    var id = req.params.id;

    var rsvp = req.body.rsvp;
    if(!rsvp){
        var rsvp = "off";
    }
    var tablerequest = req.body.tablerequest;
    if(!tablerequest){
        var tablerequest = "off";
    }
    var ticket = req.body.ticket;
    if(!ticket){
        var ticket = "off";
    }

    var purchaseticket = {rsvp : rsvp, tablerequest : tablerequest, ticket : ticket};

    var setPurchaseTicket = {
        purchaseticket : purchaseticket
    };
    //console.log(setPurchaseTicket);
    User.updateUser(id, setPurchaseTicket, function(err, purchaseticket){
        if(err){
            throw err;
        }

        req.flash('successmsg', 'This User Information Updated.');
        res.redirect('/manageVendor');
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
