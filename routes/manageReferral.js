var express = require('express');
var generator = require('generate-password');
var moment = require('moment');
var nodemailer = require('nodemailer');
var router = express.Router();

//var Referral = require('../models/referral');
var User = require('../models/user');

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

	User.getUserByReferral(function(err, users){
		if(err){
			throw err;
		}
		res.render('manageReferral', { users: users, flash: {successmsg: req.flash('successmsg'), errormsg: req.flash('errormsg'), successdel: req.flash('successdel'), title: 'Manage Referral', role: req.user.role, id: req.user._id}});		
	})
});

router.get('/addReferral', ensureAuthenticated, function(req, res, next){
	res.render('addReferral', {flash: {title: 'Add Referral', role: req.user.role, id: req.user._id}});
});

router.post('/addReferral', ensureAuthenticated, function(req, res, next){
	
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var email = req.body.email;
	var password = req.body.password;
	var role = "referral";
	var publishablekey = req.body.publishablekey;
    var secretkey = req.body.secretkey;
    var referral = '';
	var createddate = moment(Date.now()).format('MM/DD/YYYY');

	var newReferral = new User({
		firstname: firstname,
		lastname: lastname,
		email: email,
		password: password,
		role: role,
		publishablekey: publishablekey,
		secretkey: secretkey,
		referral: referral,
		createddate: createddate
	});
	console.log(newReferral);
	User.getUserByEmail(email, function(err, user){

    		if(err){
				throw err;	
			} 
			if(user != null){

				req.flash('errormsg', 'This Email Id is already exist.');

    			res.redirect('/manageReferral');
			}
			else{
				User.createUser(newReferral, function(err, newreferral){
		    		if(err) throw err;
		    	});

		    	var mailOptions = {
                    from: 'seo.itradicals@gmail.com', // sender address
                    to: email, // list of receivers
                    subject: 'Referral Profile Details.', // Subject line
                    text: 'Username: '+email+' Password: '+password, // plain text body
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message %s sent: %s', info.messageId, info.response);
                });

    			req.flash('successmsg', 'Referral Successfully Added.');

    			res.redirect('/manageReferral');		
			}
    	});

});

router.get('/addReferral/:referralid', ensureAuthenticated, function(req, res, next){

	var referralid = req.params.referralid;
	User.getUserById(referralid, function(err, user){
		if(err){
			throw err;
		}
		if(req.user.role == 'superadmin'){
			res.render('addReferral', { referral : user, flash: {title: 'Edit Referral', role: req.user.role, id: req.user._id}});
		} else{
			res.render('addReferral', { referral : user, flash: {title: 'Profile', role: req.user.role, id: req.user._id}});
		}
	});
});

router.post('/addReferral/:referralid', ensureAuthenticated, function(req, res, next){
	
	var referralid = req.params.referralid; 
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var email = req.body.email;
	var publishablekey = req.body.publishablekey;
    var secretkey = req.body.secretkey;

	var updReferral = {
		firstname: firstname,
		lastname: lastname,
		email: email,
		publishablekey: publishablekey,
		secretkey: secretkey
	};

	User.updateUser(referralid, updReferral, function(err, updreferral){
		if(err) throw err;
	});

		req.flash('successmsg', 'Referral Updated Successfully.');

		res.redirect('/manageReferral');		

});

router.get('/delReferral/:referralid', ensureAuthenticated, function(req, res){

	var referralid = req.params.referralid;

	User.delUserById(referralid, function(err, user){
		if(err){
			throw err;
		}
	});
	req.flash('successmsg', 'Referral Deleted Successfully.');

	res.redirect('/manageReferral');
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