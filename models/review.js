var mongoose = require('mongoose');
var objectId = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var ReviewSchema = new Schema({
    enduserid: {
        type: String,
        ref: 'Enduser'
    },
    userid: {
        type: String
    },
    rating: {
        type: String
    },
    comments: {
    	type: String
    },
    createddate: {
        type: Date
    }
});


var Review = module.exports = mongoose.model('Review', ReviewSchema);

module.exports.addReviewRating = function(newReview, callback){
    newReview.save(callback);
}

module.exports.getReviewByUserEnduserId = function(enduserid, userid, callback){
    var query = { $and: [ { enduserid : enduserid },{ userid : userid }] };
    Review.findOne(query, callback);
}

module.exports.updReviewRating = function(id, updReview, callback){
    var query = { _id: id};
    Review.findOneAndUpdate(query, { $set: updReview }, callback);
}

module.exports.getReviewRating = function(userid, callback){
    var query = { userid: userid};
    Review.find(query, callback).populate('enduserid', 'firstname lastname profileimage').exec();
}