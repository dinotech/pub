var express = require('express');
var router = express.Router();
var filter = require('lodash.filter');

var Event = require('../models/event');
var GuestList = require('../models/guestlist');
var User = require('../models/user');

/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
    var userid = req.user._id;
    var userpublishablekey = req.user.publishablekey;
    var usersecretkey = req.user.secretkey;
    userid = JSON.parse(JSON.stringify(userid));
    var userrole = req.user.role;
    if(userrole == 'vendor'){
      Event.getActive(function(err, activeevent){
        if(err){
            throw err;
        }  
          var vendoractiveevent = filter(activeevent, ['_id.userid', userid]);
          Event.getArchive(function(err, archiveevent){
            if(err){
                throw err;
            }
              var vendorarchiveevent = filter(archiveevent, ['_id.userid', userid]);
              Event.getDraft(function(err, draftevent){
                if(err){
                    throw err;
                } 
                var vendordraftevent = filter(draftevent, ['_id.userid', userid]);
                var active = filter(vendoractiveevent, ['_id.publishstatus', 'true']);
                var archive = filter(vendorarchiveevent, ['_id.archivedstatus', 'true']);
                var draft = filter(vendordraftevent, ['_id.draft', 'true']);
                if(active == ''){
                  active = 0;
                } else{
                  active = active[0].count;
                }
                if(archive == ''){
                  archive = 0;
                } else{
                  archive = archive[0].count;
                }
                if(draft == ''){
                  draft = 0;
                } else{
                  draft = draft[0].count;
                } 
                var totalevent = active+archive+draft;
                  Event.getEventByDate(userid, function(err, event){
                    if(err){
                      throw err;
                    }
                        if(event){
                            GuestList.getTableRequest( function(err, guestlists){
                              if(err){
                                throw err;
                              }
                              var vendortabletype = filter(guestlists, ['_id.userid', userid]);

                              var ticket = filter(vendortabletype, ['_id.tabletype', 'Ticket']);
                              var rsvp = filter(vendortabletype, ['_id.tabletype', 'RSVP']);
                              var standardtable = filter(vendortabletype, ['_id.tabletype', 'Standard Table']);
                              var premiumtable = filter(vendortabletype, ['_id.tabletype', 'Premium Table']);
                              var viptable = filter(vendortabletype, ['_id.tabletype', 'VIP Table']);
                              
                              if(ticket == ''){
                                ticket = 0;
                              } else{
                                ticket = ticket[0].count;
                              }
                              if(rsvp == ''){
                                rsvp = 0;
                              } else{
                                rsvp = rsvp[0].count;
                              }
                              if(standardtable == ''){
                                standardtable = 0;
                              } else{
                                standardtable = standardtable[0].count;
                              }
                              if(premiumtable == ''){
                                premiumtable = 0;
                              } else{
                                premiumtable = premiumtable[0].count;
                              }
                              if(viptable == ''){
                                viptable = 0;
                              } else{
                                viptable = viptable[0].count;
                              }
                              var table = standardtable+premiumtable+viptable;
                              var totaluser = ticket+rsvp+table;
                              res.render('dashboard', { active : active, archive : archive, draft : draft, totalevent : totalevent, guestlist: { ticket : ticket, rsvp : rsvp, table : table, totaluser : totaluser, eventname : event.eventname}, keys:{userpublishablekey : userpublishablekey, usersecretkey : usersecretkey}, flash: {title: 'Dashboard', role: req.user.role, id: req.user._id}});
                            });
                        } else{
                          res.render('dashboard', { active : active, archive : archive, draft : draft, totalevent : totalevent, keys:{userpublishablekey : userpublishablekey, usersecretkey : usersecretkey}, flash: {title: 'Dashboard', role: req.user.role, id: req.user._id}});
                        }
                  });
                  //res.render('dashboard', { active : active, archive : archive, draft : draft, totalevent : totalevent, flash: {title: 'Dashboard', role: req.user.role, id: req.user._id}});
              });
          });
      });
    } else if(userrole == 'superadmin'){
          User.getUserByMonths(function(err, user){
            if(err){
              throw err;
            }
            //console.log(user);
              var vendorfilter = filter(user, ['_id.role', 'vendor']);
              var jan = filter(vendorfilter, ['_id.month', 1]);
              var feb = filter(vendorfilter, ['_id.month', 2]);
              var mar = filter(vendorfilter, ['_id.month', 3]);
              var apr = filter(vendorfilter, ['_id.month', 4]);
              var may = filter(vendorfilter, ['_id.month', 5]);
              var jun = filter(vendorfilter, ['_id.month', 6]);
              var jul = filter(vendorfilter, ['_id.month', 7]);
              var aug = filter(vendorfilter, ['_id.month', 8]);
              var sep = filter(vendorfilter, ['_id.month', 9]);
              var oct = filter(vendorfilter, ['_id.month', 10]);
              var nov = filter(vendorfilter, ['_id.month', 11]);
              var dec = filter(vendorfilter, ['_id.month', 12]);

              if(jan == ''){
                jan = 0;
              } else{
                jan = jan[0].count;
              }
              if(feb == ''){
                feb = 0;
              } else{
                feb = feb[0].count;
              }
              if(mar == ''){
                mar = 0;
              } else{
                mar = mar[0].count;
              }
              if(apr == ''){
                apr = 0;
              } else{
                apr = apr[0].count;
              }
              if(may == ''){
                may = 0;
              } else{
                may = may[0].count;
              }
              if(jun == ''){
                jun = 0;
              } else{
                jun = jun[0].count;
              }
              if(jul == ''){
                jul = 0;
              } else{
                jul = jul[0].count;
              }
              if(aug == ''){
                aug = 0;
              } else{
                aug = aug[0].count;
              }
              if(sep == ''){
                sep = 0;
              } else{
                sep = sep[0].count;
              }
              if(oct == ''){
                oct = 0;
              } else{
                oct = oct[0].count;
              }
              if(nov == ''){
                nov = 0;
              } else{
                nov = nov[0].count;
              }
              if(dec == ''){
                dec = 0;
              } else{
                dec = dec[0].count;
              }
              var totalvendor = jan+feb+mar+apr+jun+jul+aug+sep+oct+nov+dec;

             res.render('merchantDashboard', { totalvendor : totalvendor, vendor:{ jan:jan, feb:feb, mar:mar, apr:apr, may:may, jun:jun, jul:jul, aug:aug, sep:sep, oct:oct, nov:nov, dec:dec}, flash: {title: 'Dashboard', role: req.user.role, id: req.user._id}});
          });
        //res.render('merchantDashboard', { flash: {title: 'Dashboard', role: req.user.role, id: req.user._id}});
    } else{
      res.render('referralDashboard', { flash: {title: 'Dashboard', role: req.user.role, id: req.user._id}});
    }
});


router.get('/test', function(req, res, next){
  
  Event.getEventsByDate(function(err, events){
        if(err){
            throw err;
        }
        eventids = [];
        events.forEach(function(doc, err){
            eventids.push(doc._id);
        });

        updEvent = {
            archivedstatus : "true",
            publishstatus : "false"
        };
        Event.updateEvents(eventids, updEvent, function(err, events){
            if(err){
                throw err;
            }
            res.json(events);
        });
    });
    
});


// Chech Authentication
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
  	if(req.user.verify == 'true' || req.user.role == 'referral'){
    	return next();
  	} else{
  		req.flash('errormsg', 'You are not Verified. Please First Accept this Agreement.');
    	res.redirect('/agreement');	
  	}
  	
  } else {
    req.flash('errormsg', 'Your are not Logged in');
    res.redirect('/');
  }
}
module.exports = router;
