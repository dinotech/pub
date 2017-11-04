var mongoose = require('mongoose');
var objectId = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var GenresSchema = new Schema({
    userid: {
        type: String
    },
    genres: {
        type: String
    }
});


var Genres = module.exports = mongoose.model('Genres', GenresSchema);

module.exports.createGenres = function(newGenres, callback){
    newGenres.save(callback);
}

module.exports.updateGenres = function(id, updGenres, callback){
        var query = { _id: id};
        Genres.findOneAndUpdate(query, { $set: updGenres }, callback);
}

module.exports.getGenresByUserId = function(id, callback){
    var query = { userid: id};
    Genres.find(query, callback);
}

module.exports.getGenres = function(callback){
    var query = { userid: ""};
    Genres.find(query, callback);
}

module.exports.getGenresById = function(id, callback){
    var query = { _id: id};
    Genres.findOne(query, callback);
}

module.exports.delGenresById = function(id, callback){
        var query = { _id: id};
        Genres.deleteOne(query, callback);
}
