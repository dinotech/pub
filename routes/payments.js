var express = require('express');
var generator = require('generate-password');
var moment = require('moment');
var router = express.Router();
var cron = require('node-cron');

// Models Included

var VendorPayment = require('../models/vendorpayment');
var MerchentPayment = require('../models/merchentpayment');

cron.schedule('0 0 0 * * *', function(){
 	VendorPayment.getVendorPayment(function(err, vendorpaymnet){
		if(err){
			throw err;
		}
		allvendorpayment = [];
        vendorpaymnet.forEach(function(doc, err){
            allvendorpayment.push(doc);
            var crrdate = moment().format('DD/MM/YYYY');
            var expiredate = doc.planexpiredate;
            if( crrdate > expiredate){
            	var paymentid = doc._id;
            	var planstatus = 'Expire';
            	var updPayment = {
            		planstatus : planstatus
            	};
            	VendorPayment.updateVendorPayment(paymentid, updPayment, function(err, updpayment){
            		if(err){
            			throw err;
            		}
            	});

            } else{
            	console.log(expiredate);
            	console.log('You are Wrong');
            }
        });

		res.render('paymentreports', { allvendorpayment : allvendorpayment, flash: { title: 'Payment Reports' }})
	});
});

/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) {

    var id = req.user._id;

	VendorPayment.getVendorPaymentById(id, function(err, vendorpaymnet){
		if(err){
			throw err;
		}

        var role = req.user.role;
        MerchentPayment.getPaymentByVenueId(id, role, function(err, payments){
        if(err){
          throw err;
        }
        console.log(payments);
          var creditcount = [];
          var debitcount = [];
          var commissioncount = [];
              payments.forEach(function(doc, err){
                if(doc.credit != '-'){
                  creditcount.push(doc.credit);
                }
                if(doc.debit != '-'){
                  debitcount.push(doc.debit);
                }
                if(doc.commissionprice != '-'){
                  commissioncount.push(doc.commissionprice);
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
              var totalcommission = 0;
              for(var i=0; i<commissioncount.length; i++)
              {
                totalcommission += parseFloat(commissioncount[i]);
              }
              var remainamount = totalcredit-totaldebit-totalcommission;             

            allvendorpayment = [];
            vendorpaymnet.forEach(function(doc, err){
                allvendorpayment.push(doc);
            });
            res.render('paymentreports', { allvendorpayment : allvendorpayment, payments : payments, totalcredit: totalcredit, totaldebit: totaldebit, remainamount : remainamount, totalcommission : totalcommission, flash: { title: 'Payment Reports', role: req.user.role, id: req.user._id }});
        });
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
