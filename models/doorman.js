var mongoose = require('mongoose');
var objectId = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var DoormanSchema = new Schema({
    userid: {
        type: String
    },
    firstname: {
    	type: String
    },
    lastname: {
        type: String
    },
    email: {
        type: String
    },
    password: {
    	type: String
    }
});


var Doorman = module.exports = mongoose.model('Doorman', DoormanSchema);

module.exports.getDoormanByUserId = function(userid, callback){
    var query = { userid : userid};
    Doorman.find(query, callback);
}

module.exports.getDoormanByEmail = function(emailid, callback){
    var query = { email : emailid };
    Doorman.findOne(query, callback);
}

module.exports.createDoorman = function(newDoorman, callback){
    newDoorman.save(callback);
}

module.exports.getDoormanById = function(id, callback){
    var query = { _id : id }
    Doorman.findOne(query, callback);
}

module.exports.updateDoorman = function(id, updDoorman, callback){
    var query = { _id: id};
    Doorman.findOneAndUpdate(query, { $set: updDoorman }, callback);
}

module.exports.delDoormanById = function(id, callback){
    var query = { _id : id };
    Doorman.deleteOne(query, callback);
}