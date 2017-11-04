var express = require('express');
var generator = require('generate-password');

var router = express.Router();

var Genres = require("../models/genres");

// Models Included



/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) {

	var userid = req.user._id;
	var role = req.user.role;

	if(role == 'superadmin' ){
		Genres.getGenres(function(err, genress){
			if(err){
				throw err;
			}
			res.render('manageGenres', { genress : genress, flash: { successmsg: req.flash('successmsg'), errormsg: req.flash('errormsg'), successdel: req.flash('successdel'), title: 'Genres', role: req.user.role, id: req.user._id }});
		});
	} else{
		Genres.getGenresByUserId(userid, function(err, genress){
			if(err){
				throw err;
			}
			res.render('manageGenres', { genress : genress, flash: { successmsg: req.flash('successmsg'), errormsg: req.flash('errormsg'), successdel: req.flash('successdel'), title: 'Genres', role: req.user.role, id: req.user._id }});
		});
	}
});

router.get('/addGenres', ensureAuthenticated, function(req, res, next) {
	res.render('addGenres', { flash: { title: 'Add Genres', role: req.user.role, id: req.user._id }})
});

router.post('/addGenres', ensureAuthenticated, function(req, res, next) {
	
	var userid = req.body.userid;
	var genres = req.body.genres;
	var role = req.user.role;

	if(role == 'superadmin'){
		var newGenres = new Genres({
			userid : "",
			genres : genres
		});
	} else{
		var newGenres = new Genres({
			userid : userid,
			genres : genres
		});
	}

	Genres.createGenres(newGenres, function(err, newgenres){
		if(err){
			throw err;
		}
	});
		req.flash('successmsg', 'Genres Successfully Added.');
		res.redirect('/manageGenres');

});

router.get('/addGenres/:id', ensureAuthenticated, function(req, res, next) {

	var id = req.params.id;

	Genres.getGenresById(id, function(arr, genres) {

		res.render('addGenres', { genres : genres, flash: { title: 'Add Genres', role: req.user.role, id: req.user._id }})
	});
});

router.post('/addGenres/:id', ensureAuthenticated, function(req, res, next) {

	var id = req.params.id;
	var genres = req.body.genres;

	updGenres = {
		genres : genres
	};

	Genres.updateGenres(id, updGenres, function(err, genres) {
		if(err){
			throw err;
		}
	});

		req.flash('successmsg', 'Genres Successfully Updated.');
		res.redirect('/manageGenres');
});

router.get('/delGenres/:id', ensureAuthenticated, function(req, res, next){
	var id = req.params.id;

	Genres.delGenresById(id, function(err, user){
		if(err){
			throw err;
		}
		req. flash('successdel', 'Genres Successfully Deleted.');
		res.redirect('/manageGenres');
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
