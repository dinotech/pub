var mongoose = require('mongoose');
var objectId = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var CardListSchema = new Schema({
    enduserid: {
    	type: String
    },
    cardname: {
    	type: String
    },
    cardno: {
        type: String
    },
    cvvcode: {
    	type: String
    },
    expiredate: {
        type: String
    }
});


var CardList = module.exports = mongoose.model('CardList', CardListSchema);

module.exports.setNewCard = function(newCard, callback){
    newCard.save(callback);
}

module.exports.getendusercardsById = function(enduserid, callback){
    var query = { enduserid : enduserid}
    CardList.find(query, callback);
}

module.exports.getendusercardsByCardno = function(cardno, callback){
    var query = { cardno : cardno}
    CardList.findOne(query, callback);
}


