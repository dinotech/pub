var express = require('express');
var router = express.Router();

var Plan = require('../models/plan');
var Currency = require('../models/currency');

/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next){

	Plan.getPlan(function(err, plans){
		if(err){
			throw err;	
		}
			allplan = [];
			plans.forEach(function(doc, err){
				allplan.push(doc);
			});

			res.render('manageFeaturedPlan', { allplan: allplan, flash: { successmsg: req.flash('successmsg'), errormsg: req.flash('errormsg'), successdel: req.flash('successdel'), title: 'Manage Featuerd Plans', role: req.user.role, id: req.user._id }});
	});
});

router.get('/addPlan', ensureAuthenticated, function(req, res, next){
	Currency.getCurrencies(function(err, currencies){
        if(err){
            throw err;
        }
		res.render('addPlan', { currencies : currencies, flash: { title: 'Add Plan', role: req.user.role, id: req.user._id }});
	});
});

router.post('/addPlan', ensureAuthenticated, function(req, res, next){
	
	var plancurrency = req.body.plancurrency;
	var plantitle = req.body.plantitle;
	var planprice = req.body.planprice;
	var planduration = req.body.planduration;

	var newPlan = new Plan({
		plancurrency : plancurrency,
		plantitle : plantitle,
		planprice : planprice,
		planduration : planduration
	});

	Plan.createPlan(newPlan, function(err, newplan){
		if(err) throw err;
	});

		req.flash('successmsg', 'Plan Created Successfully.');

    	res.redirect('/manageFeaturedPlan');

});

router.get('/addPlan/:id',ensureAuthenticated, function(req, res, next){
	
	var id = req.params.id;

	Plan.getPlanById(id, function(err, plan){
		if(err){
			throw err;
		}
		Currency.getCurrencies(function(err, currencies){
	        if(err){
	            throw err;
	        }
			res.render('addPlan', {plan: plan, currencies : currencies, flash: { title: 'Edit Plan', role: req.user.role, id: req.user._id}});
		});	
	});
	
});

router.post('/addPlan/:id', ensureAuthenticated, function(req, res, next){
	
	var id = req.params.id;
	
	var plancurrency = req.body.plancurrency;
	var plantitle = req.body.plantitle;
	var planprice = req.body.planprice;
	var planduration = req.body.planduration;

	var updPlan = {
		plancurrency : plancurrency,
		plantitle : plantitle,
		planprice : planprice,
		planduration : planduration
	};
	

				Plan.updatePlan(id, updPlan, function(err, updPlan){
                    if(err) throw err;
                });
                req.flash('successmsg', 'Your Plan is Updated.');

                res.redirect('/manageFeaturedPlan');

});

router.get('/delPlan/:id', ensureAuthenticated, function(req, res, next){
	var id = req.params.id;

	Plan.delPlanById(id, function(err, plan){
		if(err){
			throw err;
		}
		req. flash('successdel', 'Plan Successfully Deleted.');
		res.redirect('/manageFeaturedPlan');
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