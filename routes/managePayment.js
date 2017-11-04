var express = require('express');
var router = express.Router();
var moment = require('moment');


// Models Included

var User = require('../models/user');
var MerchentPayment = require('../models/merchentpayment');


/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) {

    User.getUser(function(err, users){
        if(err){
            throw err;
        }
        res.render('managePayment', { venues: users, flash: { title: 'Payment Details', role: req.user.role, id: req.user._id }});
    });
});

router.get('/getGuests/:venueid/:role', ensureAuthenticated, function(req, res, next){

  var venueid = req.params.venueid;
  var role = req.params.role;
  MerchentPayment.getPaymentByVenueId(venueid, role, function(err, payments){
    if(err){
      throw err;
    }
    //console.log(payments);
    if(role == 'vendor'){
      var creditcount = [];
      var debitcount = [];
      var commissioncount = [];
      var refcommissioncount = [];
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
            if(doc.refcommissionprice != '-'){
              refcommissioncount.push(doc.refcommissionprice);
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
          var totalrefcommission = 0;
          for(var i=0; i<refcommissioncount.length; i++)
          {
            totalrefcommission += parseFloat(refcommissioncount[i]);
          }
          var remainamount = totalcredit-totaldebit-totalcommission-totalrefcommission;

          res.send({payments: payments, role : 'vendor', totalcredit: totalcredit, totaldebit: totaldebit, remainamount : remainamount, totalcommission: totalcommission, totalrefcommission : totalrefcommission});
    } else{
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

            res.send({payments: payments, role : 'referral', totalcredit: totalcredit, totaldebit: totaldebit, remainamount : remainamount});
    }

  });

});

router.get('/payment/:venueid/:enduserid/:eventid/:publishablekey/:role/:remainamount', function(req, res, next){

  var venueid = req.params.venueid;
  var enduserid = req.params.enduserid;
  var eventid = req.params.eventid;
  var publishablekey = req.params.publishablekey;
  var role = req.params.role;
  var remainamount = req.params.remainamount;

  var details = {
    venueid : venueid,
    enduserid : enduserid,
    eventid : eventid,
    publishablekey : publishablekey,
    role : role,
    remainamount : remainamount
  };

  res.render('merchantPayment', { details: details, flash: {title: 'Payment', role: req.user.role, id: req.user._id }})
});

router.post('/payment', ensureAuthenticated, function(req, res, next){
  
  var venueid = req.body.venueid;
  var enduserid = req.body.enduserid;
  var eventid = req.body.eventid;
  var price = req.body.debitamount;
  var role = req.body.role;
  var dates = moment(Date.now()).format('DD-MM-YYYY HH:mm:ss');

  User.getUserById(venueid, function(err, user){
    if(err){
      throw err;
    }

    var stripe = require('stripe')(user.secretkey);
  
    var token = req.body.stripeToken;
    var charge = stripe.charges.create({
        amount: price*100,
        currency: 'usd',
        source: token
        }, function(err, charge){
            if(err){
              console.log(err);
            }
            if(role == 'vendor'){
              var newPayment = new MerchentPayment({
                  venueid : venueid,
                  enduserid : enduserid,
                  eventid : eventid,
                  referralid : "",
                  dates : dates,
                  credit : "-",
                  debit : price,
                  paymentid : charge.id,
                  commissionprice : "-",
                  refcommissionprice : "-",
                  refdebit : "-"
                });
            } else{
              var newPayment = new MerchentPayment({
                  venueid : venueid,
                  enduserid : enduserid,
                  eventid : eventid,
                  referralid : venueid,
                  dates : dates,
                  credit : "-",
                  debit : "-",
                  paymentid : charge.id,
                  commissionprice : "-",
                  refcommissionprice : "-",
                  refdebit : price
              });
            }

              MerchentPayment.createMerchantPayment(newPayment, function(err, payment){
                if(err){
                    throw err;
                }
                //res.redirect('/managePayment');
              });
          });
  });

res.redirect('/managePayment');
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
