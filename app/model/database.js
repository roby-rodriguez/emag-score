/**
 * Database utility (singleton).
 */
var MongoClient = require('mongodb').MongoClient;
var Q = require('q');

var Database = {
    db: null,
    connect: function () {
        if (!this.db) {
            var deferred = Q.defer();
            MongoClient.connect("mongodb://localhost:27017/emagscores-dev", function (err, database) {
                if (err) deferred.reject(new Error(err));
                else deferred.resolve(database);
            });
        } else {
            deferred.resolve(this.db);
        }
        return deferred.promise;
    }
};

module.exports = Database;