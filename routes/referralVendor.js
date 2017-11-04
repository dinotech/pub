var express = require('express');
var generator = require('generate-password');
var router = express.Router();

// Models Included
var User = require('../models/user');

router.get('/', ensureAuthenticated, function(req, res, next) {
	var referralid = req.user._id;

	User.getUserByReferralId(referralid, function(err, alluser){
		if(err){
			throw err;	
		} 

		users = [];
		alluser.forEach(function(doc, err){
			users.push(doc);
		});

		res.render('manageReferralVendor', { users: users, flash: { title: 'Vendor List', role: req.user.role, id: req.user._id}});

    });
  //res.render('vendorList', {title: 'Vendor List'});
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