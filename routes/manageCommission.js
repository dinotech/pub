var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Commission = require('../models/commission');

router.get('/', ensureAuthenticated, function(req, res, next){

	Commission.getCommission(function(err, commissions){
		if(err){
			throw err;
		}
		res.render('manageCommission', { commissions : commissions, flash: {successmsg: req.flash('successmsg'), errormsg: req.flash('errormsg'), successdel: req.flash('successdel'), title: 'Manage Commission', role: req.user.role, id: req.user._id}});
	});
});

router.get('/setCommission', ensureAuthenticated, function(req, res, next){

	User.getUser(function(err, users){
		if(err){
			throw err;
		}
		res.render('setCommission', {users : users, flash: {title: 'Set Commission', role: req.user.role, id: req.user._id}});
	});

});

router.post('/setCommission', ensureAuthenticated, function(req, res, next){

	var userid = req.body.vendor;
	var purchaseoption = req.body.purchaseoption;
	var commissiontype = req.body.commissiontype;
	var commissionprice = req.body.commissionprice;

	var newCommission = new Commission({
		userid : userid,
		purchaseoption : purchaseoption,
		commissiontype : commissiontype,
		commissionprice : commissionprice
	});

	Commission.getCommissionByUserId(userid, purchaseoption, function(err, existcommission){
		if(err){
			throw err;
		}
		if(existcommission){
			req.flash('errormsg', 'This Vendor Commission is already Exist with '+purchaseoption+'.');
			res.redirect('/manageCommission');
		} else{
			Commission.setCommission(newCommission, function(err, commission){
				if(err){
					throw err;
				}
				req.flash('successmsg', 'Vedor Commission Set Successfully.');
				res.redirect('/manageCommission');
			});
		}
	});
});

router.get('/setCommission/:id', ensureAuthenticated, function(req, res, next){

	var id = req.params.id;
	Commission.getCommissionById(id, function(err, commission){
		if(err){
			throw err;
		}
		User.getUser(function(err, users){
			if(err){
				throw err;
			}
			res.render('setCommission', {users : users, commission : commission, flash: {title: 'Set Commission', role: req.user.role, id: req.user._id}})
		});
	});
});

router.post('/setCommission/:id', ensureAuthenticated, function(req, res, next){

	var id = req.body.id;
	var purchaseoption = req.body.purchaseoption;
	var commissiontype = req.body.commissiontype;
	var commissionprice = req.body.commissionprice;

	var updCommission = {
		purchaseoption : purchaseoption,
		commissiontype : commissiontype,
		commissionprice : commissionprice
	};

	Commission.updateCommission(id, updCommission, function(err, commission){
		if(err){
			throw err;
		}
		req.flash('successmsg', 'Vedor Commission Updated.');
		res.redirect('/manageCommission');
		
	});
});

router.get('/delCommission/:id', function(req, res, next){

	var id = req.params.id;
	 Commission.delCommission(id, function(err, commission){
	 	if(err){
	 		throw err;
	 	}
	 	req.flash('successmsg', 'Vedor Commission Deleted');
		res.redirect('/manageCommission');
	 })
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