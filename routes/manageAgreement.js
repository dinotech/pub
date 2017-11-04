var express = require('express');
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'public/agreement/')
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + file.originalname);
    }
});
var upload = multer({ storage: storage});
var router = express.Router();

var Agreement = require('../models/agreement');

router.get('/', ensureAuthenticated, function(req, res, next){

	Agreement.getAgreement(function(err, agreements){
		if(err){
			throw err;
		}

	res.render('manageAgreement', {agreements: agreements, flash: {title: 'Manage Agreements', successmsg: req.flash('successmsg'), role: req.user.role, id: req.user._id}});
	});	
});

router.get('/addAgreement', ensureAuthenticated, function(req, res, next){

	res.render('addAgreement', {flash: { title: 'Add Agreement', role: req.user.role, id: req.user._id}});	 

});

router.post('/addAgreement', upload.any(), ensureAuthenticated, function(req, res, next){

	var title = req.body.title;
	var content = req.body.content;
	var valueofimage = req.files;
	if(valueofimage != ''){
		var str = valueofimage[0].destination;
	    var res1 = str.replace("public/", "");

		var agreement = res1+valueofimage[0].filename;
	} else{
		var agreement = '';
	}

	var newAgreement = new Agreement({
		title : title,
		agreement : agreement,
		content : content
	});

	Agreement.createAgreement(newAgreement, function(err, newevent){
		if(err) throw err;
	});

		req.flash('successmsg', 'Agreement Created Successfully.');

    	res.redirect('/manageAgreement');

});

router.get('/delAgreement/:id', ensureAuthenticated, function(req, res, next){

	var id = req.params.id;

	Agreement.delAgreement(id, function(err, callback){
		if(err){
			throw err;
		}

		req.flash('successmsg', 'Agreement Deleted Successfully.');
		res.redirect('/manageAgreement')
	});

});

router.get('/addAgreement/:id', ensureAuthenticated, function(req, res, next){

	var id = req.params.id;
	Agreement.getAgreementById(id, function(err, agreement){
		if(err){
			throw err;
		}

		res.render('addAgreement', {agreement: agreement, flash: { title: 'Edit Agreement', role: req.user.role, id: req.user._id}});	 

	});
});

router.post('/addAgreement/:id', upload.any(), ensureAuthenticated, function(req, res, next){

	var id = req.params.id;
	var title = req.body.title;
	var content = req.body.content;
	var valueofimage = req.files;
	if(valueofimage != ''){
		var str = valueofimage[0].destination;
	    var res1 = str.replace("public/", "");

		var agreement = res1+valueofimage[0].filename;
	} else{
		var agreement = req.body.agreement;
	}

	var updAgreement = {
		title : title,
		agreement : agreement,
		content : content
	};

	Agreement.updateAgreement(id, updAgreement, function(err, updevent){
		if(err) throw err;
	});

		req.flash('successmsg', 'Agreement Edited Successfully.');

    	res.redirect('/manageAgreement');
	
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