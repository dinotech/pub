var mongoose = require('mongoose');
var objectId = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    senderid: {
        type: String,
        ref: 'User'
    },
    reciverid: {
        type: String,
        ref: 'User'
    },
    senderrole: {
        type: String
    },
    reciverrole: {
    	type: String
    },
    senderenduser: {
        type: String,
        ref: 'Enduser'
    },
    reciverenduser: {
        type: String,
        ref: 'Enduser'
    },
    message: {
        type: String
    },
    createddate: {
        type: String
    }
});


var Message = module.exports = mongoose.model('Message', MessageSchema);

module.exports.createMessage = function(newMessage, callback){
    newMessage.save(callback);
}

module.exports.getMessageBySenderRole = function(venueid, role, callback){
    var query = { senderid : venueid};
    Message.find(query, callback).sort( { createddate: -1 } ).populate('reciverid', 'firstname lastname companyname').populate('reciverenduser', 'firstname lastname').exec();
}

module.exports.getMessageByReciverRole = function(venueid, role, callback){
    var query = { reciverid : venueid};
    Message.find(query, callback).sort( { createddate: -1 } ).populate('senderid', 'firstname lastname companyname').populate('senderenduser', 'firstname lastname').exec();
}

module.exports.getEnduserInbox = function(endusrid, callback){
    var query = { reciverenduser : endusrid};
    Message.find(query, callback).sort( { createddate: -1 } ).populate('senderid', 'firstname lastname companyname').populate('reciverenduser', 'firstname lastname').exec();
}

module.exports.getEnduserSent = function(endusrid, callback){
    var query = { senderenduser : endusrid};
    Message.find(query, callback).sort( { createddate: -1 } ).populate('reciverid', 'firstname lastname companyname').populate('senderenduser', 'firstname lastname').exec();
}