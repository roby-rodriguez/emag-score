/**
 * Database utility (singleton).
 */
var MongoClient = require('mongodb').MongoClient;
var Q = require('q');
var Constants = require('../config/generated/env');

var Database = {
    db: null,
    getURL: function () {
        var url = "mongodb://";
        if (Constants.MONGO_USERNAME && Constants.MONGO_PASSWORD)
            url = url.concat(Constants.MONGO_USERNAME + ":" + Constants.MONGO_PASSWORD + "@");
        return url.concat(Constants.MONGO_URL);
    },
    connect: function () {
        if (!this.db) {
            var deferred = Q.defer();
            MongoClient.connect(Database.getURL(), function (err, database) {
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