var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var objectId = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var UserSchema = new Schema({
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
    companyname: {
        type: String
    },
    telephone: {
        type: String
    },
    place: {
        type: String
    },
    street: {
        type: String
    },
    city: {
        type: String
    },
    tagline: {
        type: String
    },
    description: {
        type: String
    },
    dresscode: {
        type: String
    },
    genres: {
        type: [String]
    },
    facilities: {
        type: String
    },
    video: {
        type: String
    },
    coverimage: {
        type: String
    },
    venueimage: {
        type: [String]
    },
    role: {
        type: String
    },
    verify: {
        type: String
    },
    agreement: {
        type: String
    },
    currency: {
        type: String
    },
    purchaseticket:[{
        rsvp: {
            type: String
        },
        tablerequest: {
            type: String
        },
        ticket: {
            type: String
        },
    }],
    latitude: {
        type: String
    },
    longitude: {
        type: String
    },
    endpoint: {
        type: String
    },
    authSecret: {
        type: String
    },
    keys: {
        type: String
    },
    createddate: {
        type: Date
    },
    publishablekey: {
        type: String
    },
    secretkey: {
        type: String
    },
    referral: {
        type: String
    }

});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
        newUser.password = hash;
        newUser.save(callback); 
    });
});
}

module.exports.updateUser = function(id, updUser, callback){
        var query = { _id: id};
        User.findOneAndUpdate(query, { $set: updUser }, callback);
}

module.exports.updatePassword = function(userid, updPass, callback){
    bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(updPass.password, salt, function(err, hash) {
        updPass.password = hash;
        var query = { _id: userid};
        User.update(query, { $set: {password: updPass.password}}, callback); 
    });
});
}

module.exports.updateVerifyUser = function(id, updUser, callback){
        var query = { _id: id};
        User.findOneAndUpdate(query, { $set: updUser }, callback);
}

module.exports.updateFeaturedUser = function(id, updUser, callback){
        var query = { _id: id};
        User.findOneAndUpdate(query, { $set: updUser }, callback);
}

module.exports.delUserById = function(id, callback){
        var query = { _id: id};
        User.deleteOne(query, callback);
}

module.exports.getUserByRole = function(role, callback){
    //console.log("Hello2");
    var query = {role: role};
    User.findOne(query, callback);
}

module.exports.getUserByUsername = function(email, callback){
	//console.log("Hello2");
	var query = {email: email};
	User.findOne(query, callback);
}

module.exports.getUserByEmail = function(email, callback){
    var query = {email: email};
    User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	//console.log("Hello1");
	bcrypt.compare(candidatePassword, hash, function(err, isMatch){
		if(err) throw err;
		callback(null, isMatch);
	});
}

module.exports.getUserByLocation = function(keywrd, callback){
    console.log(keywrd);
    var query = {'city' : new RegExp(keywrd, 'i')};
    User.find(query, callback);
}

module.exports.getUserByVendor = function(callback){
    var query = {role: 'vendor'};
    User.find(query, callback);
}

module.exports.getUserByReferral = function(callback){
    var query = {role: 'referral'};
    User.find(query, callback);
}

module.exports.getUserByReferralId = function(referralid, callback){
    var query = { referral : referralid };
    User.find(query, callback);
}


module.exports.getUserByMonths = function(callback){
    var query = { $group:{ _id: { month: {$month: "$createddate"}, role: "$role" }, count: {$sum:1} } };
    User.aggregate(query, callback);
}

module.exports.getUser = function(callback){
    User.find(callback);
}