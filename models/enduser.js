var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EnduserSchema = new Schema({
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
    },
    dob: {
        type: String
    },
    deviceid: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    profileimage: {
        type: String
    },
    role: {
        type: String
    }
});

var Enduser = module.exports = mongoose.model('Enduser', EnduserSchema);

module.exports.createEndUser = function(newEndUser, callback){
	Enduser.create(newEndUser, callback);
}

module.exports.getUser = function(email, password, callback){
	//console.log("Hello2");
	var query = {email: email, password: password};
	Enduser.findOne(query, callback);
}

module.exports.updEnduser = function(id, updEnduser, callback){
    var query = { _id : id };
    Enduser.findOneAndUpdate(query, { $set : updEnduser }, callback);
}

module.exports.getEndUser = function(callback){
    Enduser.find(callback);
}

module.exports.getEmail = function(email, callback){
    var query = {email: email};
    Enduser.findOne(query, callback);
}

module.exports.getEndUserById = function(id, callback){
	var query = { _id : id }
    Enduser.findOne(query, callback);
}

module.exports.getDoormanByUserId = function(userid, callback){
    var query = { userid : userid};
    Enduser.find(query, callback);
}

module.exports.getDoormanByEmail = function(emailid, callback){
    var query = { email : emailid };
    Enduser.findOne(query, callback);
}

module.exports.createDoorman = function(newDoorman, callback){
    newDoorman.save(callback);
}

module.exports.getDoormanById = function(id, callback){
    var query = { _id : id }
    Enduser.findOne(query, callback);
}

module.exports.updateDoorman = function(id, updDoorman, callback){
    var query = { _id: id};
    Enduser.findOneAndUpdate(query, { $set: updDoorman }, callback);
}

module.exports.delDoormanById = function(id, callback){
    var query = { _id : id };
    Enduser.deleteOne(query, callback);
}

