var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlanSchema = new Schema({
    plancurrency: {
        type: String
    },
    plantitle: {
        type: String
    },
    planprice: {
    	type: String
    },
    planduration: {
        type: String
    }
});


var Plan = module.exports = mongoose.model('Plan', PlanSchema);

module.exports.createPlan = function(newPlan, callback){
    newPlan.save(callback);
}

module.exports.getPlan = function(callback){
    Plan.find(callback);
}

module.exports.getPlanById = function(id, callback){
    query = { _id : id }
    Plan.findOne(query, callback);
}

module.exports.updatePlan = function(id, updPlan, callback){
        var query = { _id: id};
        Plan.findOneAndUpdate(query, { $set: updPlan }, callback);
}

module.exports.delPlanById = function(id, callback){
        var query = { _id: id};
        Plan.deleteOne(query, callback);
}
