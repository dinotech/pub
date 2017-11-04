var express = require('express');
var generator = require('generate-password');
var moment = require('moment');
var router = express.Router();

var MerchentPayment = require('../models/merchentpayment');

/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
    var id = req.user._id;
    var role = req.user.role;
    MerchentPayment.getPaymentByVenueId(id, role, function(err, payments){
    if(err){
      throw err;
    }
    console.log(payments);
      var creditcount = [];
        var debitcount = [];
            payments.forEach(function(doc, err){
              if(doc.refcommissionprice != '-'){  
                creditcount.push(doc.refcommissionprice);
              }
              if(doc.refdebit != '-'){
                debitcount.push(doc.refdebit);
              }
            });
        
            var totalcredit = 0;
            for(var i=0; i<creditcount.length; i++)
            {
              totalcredit += parseFloat(creditcount[i]);
            }
            var totaldebit = 0;
            for(var i=0; i<debitcount.length; i++)
            {
              totaldebit += parseFloat(debitcount[i]);
            }
            var remainamount = totalcredit-totaldebit;             
        res.render('referralPayment', { payments : payments, totalcredit: totalcredit, totaldebit: totaldebit, remainamount : remainamount, flash: { title: 'Payment Reports', role: req.user.role, id: req.user._id }});
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
