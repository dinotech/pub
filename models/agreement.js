var mongoose = require('mongoose');
var objectId = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var AgreementSchema = new Schema({
    title: {
    	type: String
    },
    agreement: {
    	type: String
    },
    content: {
    	type: String
    }
});


var Agreement = module.exports = mongoose.model('Agreement', AgreementSchema);

module.exports.createAgreement = function(newAgreement, callback){
    newAgreement.save(callback);
}

module.exports.getAgreement = function(callback){
    Agreement.find(callback);
}

module.exports.delAgreement = function(id, callback){
    var query = { _id : id};
    Agreement.deleteOne(query, callback);
}

module.exports.getAgreementById = function(id, callback){
    var query = { _id : id};
    Agreement.findOne(query, callback);
}

module.exports.updateAgreement = function(id, updAgreement, callback){
    var query = { _id: id};
    Agreement.findOneAndUpdate(query, { $set: updAgreement }, callback);
}