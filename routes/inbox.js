var express = require('express');
var moment = require('moment');
var router = express.Router();

var User = require('../models/user');
var GuestList = require('../models/guestlist');
var Messages = require('../models/messages');

router.get('/', ensureAuthenticated, function(req, res, next){
			var venueid = req.user._id;
      var role = req.user.role;
      var referral = req.user.referral;

      User.getUser(function(err, users){
        if(err){
          throw err;
        }

      Messages.getMessageByReciverRole(venueid, role, function(err, messages){
        if(err){
          throw err;
        } console.log(messages);
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
          if(referral != ''){
            User.getUserById(referral, function(err, refer){
              if(err){
                throw err;
              }
              res.render('inbox',  { users : users, refer : refer, messages : messages, allenduser : allenduser, flash: {successmsg: req.flash('successmsg'), errormsg: req.flash('errormsg'), successdel: req.flash('successdel'), title: 'Inbox', role: req.user.role, id: req.user._id}}); 
            });
          } else{
              if(role == 'referral'){
                User.getUserByReferralId(venueid, function(err, venues){
                  if(err){
                    throw err;
                  }
                  res.render('inbox',  { users : users, messages : messages, allenduser : allenduser, venues : venues, flash: {successmsg: req.flash('successmsg'), errormsg: req.flash('errormsg'), successdel: req.flash('successdel'), title: 'Inbox', role: req.user.role, id: req.user._id}});	
                });
              } else{
                res.render('inbox',  { users : users, messages : messages, allenduser : allenduser, flash: {successmsg: req.flash('successmsg'), errormsg: req.flash('errormsg'), successdel: req.flash('successdel'), title: 'Inbox', role: req.user.role, id: req.user._id}});  
              }
          }
        });
      });
  });
});

router.post('/', ensureAuthenticated, function(req, res){

  var senderid = req.user._id;
  var reciver = req.body.venueid;
  var result = reciver.split(',');
  var reciverid = result[0];
  var senderrole = req.user.role;
  var reciverrole = result[1];
  var message = req.body.message;
  var createddate = moment(Date.now()).format('DD-MM-YYYY HH:mm:ss');

  if(reciverrole == 'enduser'){
    var newMessage = new Messages({
      senderid : senderid,
      reciverenduser : reciverid,
      senderrole : senderrole,
      reciverrole : reciverrole,
      message : message,
      createddate : createddate
    });
  } else{
    var newMessage = new Messages({
      senderid : senderid,
      reciverid : reciverid,
      senderrole : senderrole,
      reciverrole : reciverrole,
      message : message,
      createddate : createddate
    });
  }
  //console.log(newMessage);

  Messages.createMessage(newMessage, function(err, message){
    if(err){
      throw err;
    }
  });
  req.flash('successmsg', 'Message Send Successfully.');
  res.redirect('/inbox');
});

router.get('/sent', ensureAuthenticated, function(req, res){
      var venueid = req.user._id;
      var role = req.user.role;
      var referral = req.user.referral;

      User.getUser(function(err, users){
        if(err){
          throw err;
        }

      Messages.getMessageBySenderRole(venueid, role, function(err, messages){
        if(err){
          throw err;
        }console.log(messages);
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
          if(referral != ''){
            User.getUserById(referral, function(err, refer){
              if(err){
                throw err;
              }
              res.render('sent',  { users : users, refer : refer, messages : messages, allenduser : allenduser, flash: {successmsg: req.flash('successmsg'), errormsg: req.flash('errormsg'), successdel: req.flash('successdel'), title: 'Sent', role: req.user.role, id: req.user._id}}); 
            });
          } else{
              res.render('sent',  { users : users, messages : messages, allenduser : allenduser, flash: {successmsg: req.flash('successmsg'), errormsg: req.flash('errormsg'), successdel: req.flash('successdel'), title: 'Sent', role: req.user.role, id: req.user._id}});  
          }
        });
      });
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