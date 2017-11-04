var mongoose = require('mongoose');
var objectId = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var CurrencySchema = new Schema({
    currencytitle: {
        type: String
    },
    symbol: {
        type: String
    }
});


var Currency = module.exports = mongoose.model('Currency', CurrencySchema);

module.exports.createCurrency = function(newCurrency, callback){
    console.log(newCurrency);
    newCurrency.save(callback);
}

module.exports.getCurrencies = function(callback){
    Currency.find(callback);
}

module.exports.getCurrencyById = function(id, callback){
    var query = { _id: id};
    Currency.findOne(query, callback);
}

module.exports.updateCurrency = function(id, updCurrency, callback){
        var query = { _id: id};
        Currency.findOneAndUpdate(query, { $set: updCurrency }, callback);
}

module.exports.delCurrencyById = function(id, callback){
        var query = { _id: id};
        Currency.deleteOne(query, callback);
}

