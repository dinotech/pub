var mongoose = require('mongoose');
var objectId = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var EventSchema = new Schema({
    userid: {
    	type: String,
        ref: 'User'
    },
    eventname: {
    	type: String
    },
    fromdate: Date,
    todate: Date,
    video: {
        type: String
    },
    rotateimage: {
        type: String
    },
    coverimage: {
        type: String
    },
    eventimage: {
        type: [String]
    },
    entryfee: {
        type: String
    },
    standardtable: [{
        guestlimit: {
            type: Number
        },
        tablecount: {
            type: Number
        },
        tableprice: {
            type: Number
        },
    }],
    premiumtable:[{
        guestlimit: {
            type: Number
        },
        tablecount: {
            type: Number
        },
        tableprice: {
            type: Number
        },
    }],
    viptable:[{
        guestlimit: {
            type: Number
        },
        tablecount: {
            type: Number
        },
        tableprice: {
            type: Number
        },
    }],
    eventdetails: {
        type: String
    },
    genres: {
        type: [String]
    },
    dresscode: {
        type: String
    },
    eventdj: {
        type: [String],
        ref: 'Dj'
    },
    featuredstatus: {
        type: String
    },
    publishstatus: {
        type: String
    },
    draft: {
        type: String
    },
    videolink: {
        type: String
    },
    memberlimit: {
        type: String
    },
    rsvpoffers: {
        type: String
    },
    archivedstatus:{
        type: String
    }
});


var Event = module.exports = mongoose.model('Event', EventSchema);

module.exports.createEvent = function(newEvent, callback){
    newEvent.save(callback);
}

module.exports.getEvent = function(callback){
    Event.find(callback);
}

module.exports.updateFeaturedUser = function(id, updEvent, callback){
        var query = { _id: id};
        Event.findOneAndUpdate(query, { $set: updEvent }, callback);
}

module.exports.getFeaturedEvent = function(callback){
    var query = {featuredstatus: 'true'};
    Event.find(query, callback).populate('userid').exec();
}

module.exports.getEventByUserId = function(userid, callback){
    var query = {userid: userid};
    Event.find(query, callback);
}

module.exports.getFstatusEvent = function(featuredstatus, callback){
    var query = {featuredstatus: featuredstatus};
    Event.find(query, callback);
}

module.exports.getEventById = function(id, callback){
    var query = { _id: id};
    Event.findOne(query, callback);
}

module.exports.updateEvent = function(id, updEvent, callback){
        var query = { _id: id};
        Event.findOneAndUpdate(query, { $set: updEvent }, callback);
}

module.exports.delEventById = function(id, callback){
        var query = { _id: id};
        Event.deleteOne(query, callback);
}

module.exports.getDjEvent = function(djid, callback){
    var query = {  eventdj: { $eq: djid }};
    Event.find(query, callback);
}

module.exports.getTabledetailsById = function(eventid, callback){
    var query = { _id: eventid };
    Event.findOne(query, callback);
}

module.exports.getEventByDate = function(id, callback){
    var query = { userid : id, "fromdate":{"$gte": new Date() }, publishstatus: "true" };
    Event.findOne(query, callback).sort( { fromdate: 1 } );
}

module.exports.getEventByPublishId = function(id, callback){
    var query = {publishstatus: "true", userid: id};
    Event.find(query, callback);
}

module.exports.getEventByUserEventId = function(userid, eventid, callback){
    var query = { userid: userid, _id: eventid};
    Event.findOne(query, callback);
}

module.exports.getActive = function(callback){
    var query = {$group : { _id : { userid : '$userid', publishstatus : '$publishstatus'}, count : {$sum : 1}}};
    Event.aggregate(query, callback);
}

module.exports.getArchive = function(callback){
    var query = {$group : { _id : { userid : '$userid', archivedstatus : '$archivedstatus'}, count : {$sum : 1}}};
    Event.aggregate(query, callback);
}

module.exports.getDraft = function(callback){
    var query = {$group : { _id : { userid : '$userid', draft : '$draft'}, count : {$sum : 1}}};
    Event.aggregate(query, callback);
}

module.exports.getEventsByDate = function(callback){
    var query = { "fromdate":{"$lt": new Date() } };
    Event.find(query, callback);
}

module.exports.updateEvents = function(ids, updEvent, callback){
        var query = { _id: { $in: ids }};
        Event.updateMany(query, { $set: updEvent }, callback);
}