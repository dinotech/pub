var mongoose = require('mongoose');
var objectId = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var GuestListSchema = new Schema({
    venueid: {
    	type: String,
        ref: 'User'
    },
    enduserid: {
        type: String,
        ref: 'Enduser'
    },
    eventid: {
    	type: String,
        ref: 'Event'
    },
    eventdate: {
        type: String
    },
    bookingdate: {
    	type: String
    },
    bookingreference: {
        type: String
    },
    qrcode: {
        type: String
    },
    tabletype: {
        type: String
    },
    tableprice: {
        type: String
    },
    totalprice: {
        type: String
    },
    requesttable: {
        type: String
    },
    status: {
        type: String
    },
    rsvpstatus: {
        type: String
    },
    checkin: {
        type: String
    }
});


var GuestList = module.exports = mongoose.model('GuestList', GuestListSchema);

module.exports.setNewUser = function(newEndUser, callback){
    newEndUser.save(callback);
}

module.exports.updateUser = function(id, updUser, callback){
    var query = { _id: id};
    GuestList.findOneAndUpdate(query, { $set: updUser }, callback);
}

module.exports.getGuestListByUserEventId = function(userid, eventid, callback){
    var query = { venueid: userid, eventid: eventid};
    GuestList.find(query, callback).populate('enduserid').exec();
}

module.exports.updRequestById = function(id, updGuestList, callback){
    var query = { _id : id};
    GuestList.findOneAndUpdate(query, { $set: updGuestList }, callback);
}

module.exports.getTableRequest = function(callback){
    var query = {$group : { _id : { userid : '$venueid', tabletype : '$tabletype'}, count : {$sum : 1}}};
    GuestList.aggregate(query, callback);
}

module.exports.updsccaned = function(id, updGuest, callback){
    var query = { _id : id};
    GuestList.findOneAndUpdate(query, { $set: updGuest }, callback);
}

module.exports.getGuestListByEnduserId = function(enduserid, callback){
    var query = { enduserid: enduserid};
    GuestList.find(query, callback).populate('venueid', 'companyname latitude longitude').populate({ path: 'eventid', select: 'eventname fromdate todate archivedstatus' }).exec();
}

module.exports.getGuestListByEventId = function(eventid, callback){
    var query = { eventid: eventid};
    GuestList.find(query, callback).populate({ path: 'enduserid', select: 'firstname lastname email'}).exec();
}

module.exports.getGuestListByVenueId = function(venueid, callback){
    var query = { venueid: venueid};
    GuestList.find(query, callback).sort( { bookingdate: -1 } ).populate('enduserid', 'email').populate('eventid', 'eventname').exec();
}

module.exports.getVenue = function(venueid, callback){
    var query = { venueid: venueid};
    GuestList.find(query, callback).populate('enduserid', 'firstname lastname deviceid role').exec();
}
