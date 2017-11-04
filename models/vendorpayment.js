var mongoose = require('mongoose');
var objectId = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var VendorPaymentSchema = new Schema({
    userid: {
        type: String
    },
    eventid: {
    	type: String,
        ref: 'Event'
    },
    plantitle: {
        type: String
    },
    planprice: {
    	type: String
    },
    plandate: {
    	type: String
    },
    planexpiredate: {
        type: String
    },
    planstatus: {
        type: String
    }
});


var VendorPayment = module.exports = mongoose.model('VendorPayment', VendorPaymentSchema);

module.exports.createVendorPayment = function(newVendorPayment, callback){
    newVendorPayment.save(callback);
}

module.exports.getVendorPayment = function(callback){
    VendorPayment.find(callback).populate('eventid').exec();
}

module.exports.updateVendorPayment = function(paymentid, updPayment, callback){
        var query = { _id: paymentid};
        VendorPayment.findOneAndUpdate(query, { $set: updPayment }, callback);
}

module.exports.getVendorPaymentById = function(id, callback){
    query = { userid : id };
    VendorPayment.find(query, callback).populate('eventid').exec();
}
