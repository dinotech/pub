var mongoose = require('mongoose');
var objectId = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var ReferralPaymentSchema = new Schema({
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
    dates: {
        type: String
    },
    credit: {
        type: String
    },
    debit: {
        type: String
    },
    paymentid: {
        type: String
    },
    commissionprice: {
        type: String
    }
});


var ReferralPayment = module.exports = mongoose.model('ReferralPayment', ReferralPaymentSchema);

module.exports.createReferralPayment = function(newPayment, callback){
    newPayment.save(callback);
}

module.exports.getPaymentByVenueId = function(venueid, callback){
    var query = { venueid : venueid };
    ReferralPayment.find(query, callback).sort( { dates: -1 } ).populate('venueid', 'publishablekey secretkey').populate('eventid', 'eventname').populate('enduserid', 'firstname lastname').exec();
}
