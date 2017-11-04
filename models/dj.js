var mongoose = require('mongoose');
var objectId = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var DjSchema = new Schema({
    userid: {
        type: String
    },
    djname: {
    	type: String
    },
    email: {
        type: String
    },
    aboutdj: {
    	type: String
    },
    city: {
    	type: String
    },
    state: {
        type: String
    },
    genres: {
        type: [String]
    },
    profileimage: {
        type: String
    },
    coverimage: {
        type: String
    },
    djverify: {
        type: String
    }
});


var Dj = module.exports = mongoose.model('Dj', DjSchema);

module.exports.createDj = function(newDj, callback){
    newDj.save(callback);
}

module.exports.getDj = function(callback){
    Dj.find(callback);
}

module.exports.getDjByEmail = function(email, callback){
    var query = {email: email};
    Dj.findOne(query, callback);
}

module.exports.getDjById = function(id, callback){
    var query = { _id: id};
    Dj.findOne(query, callback);
}

module.exports.getDjByUserId = function(id, callback){
    var query = { userid: id};
    Dj.find(query, callback);
}

module.exports.getDjByIds = function(ids, callback){
    var query = { _id: { $in: ids } };
    Dj.find(query, callback);
}

module.exports.delDjById = function(id, callback){
        var query = { _id: id};
        Dj.deleteOne(query, callback);
}

module.exports.updateDj = function(id, updDj, callback){
        var query = { _id: id};
        Dj.findOneAndUpdate(query, { $set: updDj }, callback);
}

module.exports.updateVerifyDj = function(id, updDj, callback){
        var query = { _id: id};
        Dj.findOneAndUpdate(query, { $set: updDj }, callback);
}