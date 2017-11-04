var express = require('express');
var generator = require('generate-password');
var nodemailer = require('nodemailer');
var router = express.Router();

var Doorman = require('../models/enduser');

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

router.get('/', ensureAuthenticated, function(req, res, next){

	var userid = req.user._id;
	Doorman.getDoormanByUserId(userid, function(err, doormans){
		if(err){
				throw err;	
			} 
		allDoorman = [];
		doormans.forEach(function(doc, err){
			allDoorman.push(doc);
		})
	res.render('manageDoorman', { alldoorman: allDoorman, flash: {successmsg: req.flash('successmsg'), errormsg: req.flash('errormsg'), successdel: req.flash('successdel'), title: 'Manage Doorman', role: req.user.role, id: req.user._id}});		

	});
});

router.get('/addDoorman',ensureAuthenticated, function(req, res, next){
	res.render('addDoorman', {flash: {title: 'Add Doorman', role: req.user.role, id: req.user._id}});
});

router.post('/addDoorman',ensureAuthenticated, function(req, res, next){
	
	var userid = req.user._id;
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var email = req.body.email;
	var password = req.body.password;
	var city = "";
	var dob = "";
	var state = "";
	var role = "doorman";

	var newDoorman = new Doorman({
		userid: userid,
		firstname: firstname,
		lastname: lastname,
		email: email,
		password: password,
		city: city,
		dob: dob,
		state: state,
		role: role
	});
	
	Doorman.getDoormanByEmail(email, function(err, doorman){

    		if(err){
				throw err;	
			} 
			if(doorman != null){

				req.flash('errormsg', 'This Email Id is already exist.');

    			res.redirect('/manageDoorman');
			}
			else{
				Doorman.createDoorman(newDoorman, function(err, newdoorman){
		    		if(err){
		    			throw err;
		    		}
		    			var mailOptions = {
                            from: 'seo.itradicals@gmail.com', // sender address
                            to: email, // list of receivers
                            subject: 'Doorman Profile Detail.', // Subject line
                            text: 'Username: '+email+' Password: '+password, // plain text body
                        };

                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                return console.log(error);
                            }
                            console.log('Message %s sent: %s', info.messageId, info.response);
                        });
		    	});

    			req.flash('successmsg', 'Doorman Successfully Added.');

    			res.redirect('/manageDoorman');		
			}
    	});

});

router.get('/addDoorman/:id',ensureAuthenticated, function(req, res, next){

	var id = req.params.id;

		Doorman.getDoormanById(id, function(err, doorman){
			if(err){
				throw err;
			}

			res.render('addDoorman', {doorman: doorman, flash: {title: 'Edit Doorman', role: req.user.role, id: req.user._id}});

		});
	
});

router.post('/addDoorman/:id',ensureAuthenticated, function(req, res, next){
	
	var id = req.params.id;

	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var email = req.body.email;
	var password = req.body.password;

	var updDoorman = {
		firstname: firstname,
		lastname: lastname,
		email: email,
		password: password
	};

	Doorman.updateDoorman(id, updDoorman, function(err, newdoorman){
		if(err) throw err;
	});

	req.flash('successmsg', 'Doorman Successfully Updated.');

	res.redirect('/manageDoorman');	

});

router.get('/delDoorman/:id', ensureAuthenticated, function(req, res, next){
	var id = req.params.id;

	Doorman.delDoormanById(id, function(err, doorman){
		if(err){
			throw err;
		}
		req. flash('successdel', 'Doorman Successfully Deleted.');
		res.redirect('/manageDoorman');
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