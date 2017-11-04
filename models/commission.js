var mongoose = require('mongoose');
var objectId = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var CommissionSchema = new Schema({
    userid: {
        type: String,
        ref: 'User'
    },
    purchaseoption: {
        type: String
    },
    commissiontype: {
    	type: String
    },
    commissionprice: {
        type: String
    }
});


var Commission = module.exports = mongoose.model('Commission', CommissionSchema);

module.exports.setCommission = function(newCommission, callback){
    newCommission.save(callback);
}

module.exports.getCommission = function(callback){
    Commission.find(callback).populate('userid', 'companyname role firstname lastname').exec();
}

module.exports.getCommissionByUserId = function(userid, purchaseoption, callback){
    var query = { userid : userid, purchaseoption : purchaseoption };
    Commission.findOne(query, callback);
}

module.exports.getCommissionById = function(id, callback){
    var query = { _id : id };
    Commission.findOne(query, callback);
}

module.exports.updateCommission = function(id, updCommission, callback){
    var query = { _id : id };
    Commission.findOneAndUpdate(query, { $set : updCommission }, callback)
}

module.exports.delCommission = function(id, callback){
    var query = { _id : id };
    Commission.deleteOne(query, callback);
}

module.exports.getCommissionByVenueId = function(venueid, tabletype, callback){
    var query = { userid : venueid, purchaseoption : tabletype };
    Commission.findOne(query, callback).populate('userid', 'referral');
}