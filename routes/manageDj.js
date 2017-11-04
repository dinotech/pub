var express = require('express');
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'public/images/dj/')
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + file.originalname);
    }
});
var upload = multer({ storage: storage});
var router = express.Router();

var Dj = require('../models/dj');
var Genres = require('../models/genres');

router.get('/', ensureAuthenticated, function(req, res, next){

	var id = req.user._id;

	Dj.getDjByUserId(id, function(err, djs){
			if(err){
				throw err;	
			} 
				alldj = [];
				djs.forEach(function(doc, err){
					alldj.push(doc);
				});				
			res.render('manageDj',  {flash: {alldj: alldj, successmsg: req.flash('successmsg'), errormsg: req.flash('errormsg'), successdel: req.flash('successdel'), title: 'DJ', role: req.user.role, id: req.user._id}});	
	});

	
	
});

router.get('/addDj',ensureAuthenticated, function(req, res, next){
	var userid = req.user._id;
	Genres.getGenresByUserId(userid, function(err, genress){
		if(err){
			throw err;
		}
		res.render('addDj', {dj: '', genress : genress, flash: {title: 'Add DJ', role: req.user.role, id: req.user._id}});
	});
});

router.post('/addDj', upload.any(),ensureAuthenticated, function(req, res, next){

	var userid = req.user._id;
	var djname = req.body.djname;
	var email = req.body.email;
	var aboutdj = req.body.aboutdj;
	var city = req.body.city;
	var state = req.body.state;
	var genres = req.body.genres;

	var valueofimage = req.files;
	if(valueofimage != ''){
	    var str = valueofimage[0].destination;
	    var res1 = str.replace("public/", "");

	    var profileimage = res1+valueofimage[0].filename;
	    var coverimage = res1+valueofimage[1].filename;
	} else{
		var profileimage = "";
		var coverimage = "";
	}

	var djverify = "false";

	var newDj = new Dj({
		userid : userid,
		djname : djname,
		email : email,
		aboutdj : aboutdj,
		city : city,
		state : state,
		genres : genres,
		profileimage : profileimage,
		coverimage : coverimage,
		djverify : djverify
	});

	Dj.getDjByEmail(email, function(err, dj){

    		if(err){
				throw err;	
			} 
			if(dj != null){

				req.flash('errormsg', 'This Email Id is already exist.');

    			res.redirect('/manageDj');
			}
			else{
				Dj.createDj(newDj, function(err, newdj){
		    		if(err) throw err;
		    	});

    			req.flash('successmsg', 'Dj Successfully Added.');

    			res.redirect('/manageDj');		
			}
    	});

});

router.get('/addDj/:id',ensureAuthenticated, function(req, res, next){
	
	var id = req.params.id;
	var userid = req.user._id;
	Genres.getGenresByUserId(userid, function(err, genress){
		if(err){
			throw err;
		}
		Dj.getDjById(id, function(err, dj){
			if(err){
				throw err;
			}

			res.render('addDj', {dj: dj, genress : genress, flash: { title: 'Edit DJ', role: req.user.role, id: req.user._id}});	
		});
	});
	
});

router.get('/delDj/:id', ensureAuthenticated, function(req, res, next){
	var id = req.params.id;

	Dj.delDjById(id, function(err, user){
		if(err){
			throw err;
		}
		req. flash('successdel', 'Dj Successfully Deleted.');
		res.redirect('/manageDj');
	});
});

router.post('/addDj/:id', upload.any(),ensureAuthenticated, function(req, res, next){
	
	var id = req.params.id;
	var userid = req.user._id;
	var djname = req.body.djname;
	var email = req.body.email;
	var aboutdj = req.body.aboutdj;
	var city = req.body.city;
	var state = req.body.state;

	var valueofimage = req.files;
	if(valueofimage != ''){
	    var str = valueofimage[0].destination;
	    var res1 = str.replace("public/", "");

	    var profileimage = res1+valueofimage[0].filename;
	    var coverimage = res1+valueofimage[1].filename;
	} else{
		var profileimage = req.body.profileimage;
		var coverimage = req.body.coverimage;
	}

	var djverify = "false";

	var updDj = {
		userid : userid,
		djname : djname,
		email : email,
		aboutdj : aboutdj,
		city : city,
		state : state,
		profileimage : profileimage,
		coverimage : coverimage,
		djverify : djverify
	};

				Dj.updateDj(id, updDj, function(err, updDj){
                    if(err) throw err;
                });
                req.flash('successmsg', 'Your Information is Updated.');

                res.redirect('/manageDj');

});

router.post('/upddjverify/:id', ensureAuthenticated, function(req, res, next){
	var id = req.params.id;
	var djverify = req.body.djverify;

	
	if(!djverify)
	{
		djverify = 'false';
	}

	var updDj = {
		djverify : djverify
	};
	
	Dj.updateVerifyDj(id, updDj, function(err, updUser){
			if(err){
				throw err;
			}
	});
            if(djverify == 'true')
            {
				req.flash('successmsg', 'This Dj is Verified.');
            } else{
                req.flash('successmsg', 'This Dj is UnVerified.');
            }

                res.redirect('/manageDj');
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