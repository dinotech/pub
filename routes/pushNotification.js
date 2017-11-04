var express = require('express');
var gcm = require('node-gcm');
var router = express.Router();

var GuestList = require('../models/guestlist');

router.get('/', ensureAuthenticated, function(req, res, next){

	var venueid = req.user._id;

	GuestList.getVenue(venueid, function(err, endusers){
		if(err){
			throw err;
		}
		var allenduser = [];
		endusers.forEach(function(doc, err){
			if(allenduser == ''){
				allenduser.push(doc);
			}
			allenduser.forEach(function(docs, err){
				if(docs.enduserid._id != doc.enduserid._id){
					allenduser.push(doc);	
				}
			});
		});
		res.render('pushNotification', { allenduser : allenduser, flash: {title: 'Push Notification', role: req.user.role, id: req.user._id}});
	
	});
});

router.post('/', ensureAuthenticated, function(req, res){
	
	var title = req.body.title;
	var content = req.body.content;
	var endusers = req.body.endusers;
	//console.log(endusers);
	var sender = new gcm.Sender('AIzaSyAlaDD-ak7bLzpOqCQ3fgJ3bIw2NZ0g99c');
 
        var message = new gcm.Message();
     
        message.addNotification({
          title: title,
          body: content,
          icon: 'ic_launcher'
        });
     
        //var regTokens = ['eXe1A-BHHRw:APA91bHAWsKN6zJmVFMqXjrxQJ0xLgaH7EIL0WHRDMVX7DHACX6a8gIpfAVLYk_LgLnIVc7xxgrhC_U1MUjfMNhgXPiUD6l8bwMeYuk-OjWiltbqD2N4AlozjBhaMCWWOE4PMyFXZffH'];
     	
     
        sender.send(message, { registrationTokens: endusers }, function (err, response) {
            if (err){
                throw err;
            }
            console.log(response);
        });
        res.redirect('/pushNotification');
})


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