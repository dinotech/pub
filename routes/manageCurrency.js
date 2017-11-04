var express = require('express');
var multer = require('multer');

var router = express.Router();

var Currency = require('../models/currency');

router.get('/', ensureAuthenticated, function(req, res, next){
	
	Currency.getCurrencies(function(err, currencies){
		if(err){
			throw err;
		}
		res.render('manageCurrency', { currencies : currencies, flash: { successmsg: req.flash('successmsg'), errormsg: req.flash('errormsg'), successdel: req.flash('successdel'), title: 'Manage Currencies',  role: req.user.role, id: req.user._id }});
	});
});

router.get('/addCurrency', ensureAuthenticated, function(req, res, next) {
	res.render('addCurrency', { flash: { title: 'Add Currency', role: req.user.role, id: req.user._id }})
});

router.post('/addCurrency', ensureAuthenticated, function(req, res, next) {
	
	var currencytitle = req.body.currencytitle;
	var symbol = req.body.symbol;

	var newCurrency = new Currency({
		currencytitle : currencytitle,
		symbol : symbol
	});

	Currency.createCurrency(newCurrency, function(err, newcurrency){
		if(err){
			throw err;
		}
	});
		req.flash('successmsg', 'Currency Successfully Added.');
		res.redirect('/manageCurrency');

});

router.get('/addCurrency/:id', ensureAuthenticated, function(req, res, next) {

	var id = req.params.id;

	Currency.getCurrencyById(id, function(err, currency) {
		if (err){
			throw err;
		}
		res.render('addCurrency', { currency : currency, flash: { title: 'Edit Currency', role: req.user.role, id: req.user._id }})
	});
});

router.post('/addCurrency/:id', ensureAuthenticated, function(req, res, next) {

	var id = req.params.id;
	var currencytitle = req.body.currencytitle;
	var symbol = req.body.symbol;

	updCurrency = {
		currencytitle : currencytitle,
		symbol : symbol
	};

	Currency.updateCurrency(id, updCurrency, function(err, currency) {
		if(err){
			throw err;
		}
	});

		req.flash('successmsg', 'Currency Successfully Updated.');
		res.redirect('/manageCurrency');
});

router.get('/delCurrency/:id', ensureAuthenticated, function(req, res, next){
	var id = req.params.id;

	Currency.delCurrencyById(id, function(err, currency){
		if(err){
			throw err;
		}
		req. flash('successdel', 'Currency Successfully Deleted.');
		res.redirect('/manageCurrency');
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