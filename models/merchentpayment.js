var mongoose = require('mongoose');
var objectId = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var MerchentPaymentSchema = new Schema({
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
    referralid: {
        type: String,
        ref: 'User'
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
    },
    refcommissionprice: {
        type: String
    },
    refdebit: {
        type: String
    }
});


var MerchentPayment = module.exports = mongoose.model('MerchentPayment', MerchentPaymentSchema);

module.exports.createMerchantPayment = function(newPayment, callback){
    newPayment.save(callback);
}

module.exports.getPaymentByVenueId = function(venueid, role, callback){
    if(role == 'vendor'){
        var query = { venueid : venueid };
        MerchentPayment.find(query, callback).sort( { dates: -1 } ).populate('venueid', 'publishablekey secretkey').populate('eventid', 'eventname').populate('enduserid', 'firstname lastname email').exec();
    } else{
        var query = { referralid : venueid };
        MerchentPayment.find(query, callback).sort( { dates: -1 } ).populate('venueid', 'publishablekey secretkey').populate('eventid', 'eventname').populate('enduserid', 'firstname lastname email').populate('referralid', 'publishablekey secretkey').exec();
    }
}
