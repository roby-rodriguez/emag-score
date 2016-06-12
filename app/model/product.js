/**
 * Product document model.
 *
 * Start mongo first by running (for ex.):
 * C:\Program Files\MongoDB\Server\3.0\bin\mongod.exe
 *
 * Links:
 * http://docs.mongodb.org/manual/core/crud-introduction/
 * http://mongodb.github.io/node-mongodb-native/2.0/api/
 * https://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#mongoclient-connection-pooling
 * http://christiankvalheim.com/post/the_new_bulk_api/
 * http://stackoverflow.com/questions/26924221/mongodb-journal-in-write-concern
 * http://stackoverflow.com/questions/5373198/mongodb-relationships-embed-or-reference
 */
// you first have to enable 'emagscore-dev' by  calling 'use emagscore-dev' in mongo shell
var Database  = require('./database');
var DateUtil = require('../common/dateUtil');

var Product = {
    findProductsByTitle: function(req, res) {
        console.log('findProductsByTitle: ' + req.params.title);
        Database.connect().done(function (database) {
                var pageNr = req.params.pageNr;
                var resultsPerPage = parseInt(req.params.resultsPerPage);
                database.collection('product')
                    .find({name: { $regex: req.params.title, $options: 'i'}})
                    .skip(pageNr > 0 ? ((pageNr - 1) * resultsPerPage) : 0)
                    .limit(resultsPerPage)
                    .toArray(function (err, docs) {
                    if (err) {
                        console.log('Error: ' + err);
                    } else {
                        console.log('found: ' + docs);
                        res.jsonp(docs);
                    }
                });
            }, function (reason) {
                // handle onRejected
                // todo build custom error handler -> http://expressjs.com/guide/error-handling.html
                console.log(reason);
            }
        );
    },
    findAllProducts: function(req, res) {
        // for large amounts of documents skip() is slow, use http://stackoverflow.com/a/7230040
        Database.connect().done(function (database) {
                var pageNr = req.params.pageNr;
                var resultsPerPage = parseInt(req.params.resultsPerPage);
                var query;
                if (isNaN(resultsPerPage)) resultsPerPage = 5;
                console.log("page no: " + pageNr + " results per page: " + resultsPerPage);
                if (req.params.category && req.params.category !== 'undefined')
                    query = database.collection('product').find({category: req.params.category});
                else
                    query = database.collection('product').find();
                query
                    .skip(pageNr > 0 ? ((pageNr - 1) * resultsPerPage) : 0)
                    .limit(resultsPerPage)
                    .toArray(function (err, docs) {
                    console.log('findAllProducts: ' + docs);
                    res.jsonp(docs);
                });
            }, function (reason) {
                // handle onRejected
                // todo build custom error handler -> http://expressjs.com/guide/error-handling.html
                console.log(reason);
            }
        );
    },
    findTotalNrOfProducts: function(req, res) {
        console.log('findTotalNrOfProducts: ' + req.params.category);
        Database.connect().done(function (database) {
                var queryObject = {};
                //todo refactor this - it's way too ugly like this
                if (req.params.category && req.params.category !== 'undefined')
                    queryObject.category = req.params.category;
                else if (req.params.title && req.params.title !== 'undefined')
                    queryObject.name = { $regex: req.params.title, $options: 'i'};

                if (req.params.type && req.params.type === 'low')
                    queryObject.trending = { $lt : 0 };
                else if (req.params.type && req.params.type === 'high')
                    queryObject.trending = { $gt : 0 };

                database.collection('product').find(queryObject).count(function (err, count) {
                    console.log('findTotalNrOfProducts: ' + count);
                    res.jsonp(count);
                });
            }, function (reason) {
                // handle onRejected
                // todo build custom error handler -> http://expressjs.com/guide/error-handling.html
                console.log(reason);
            }
        );
    },
    findProductsTrending: function(req, res) {
        Database.connect().done(function (database) {
                var type = req.params.type;
                var pageNr = req.params.pageNr;
                var resultsPerPage = parseInt(req.params.resultsPerPage);
                var query;
                if (isNaN(resultsPerPage)) resultsPerPage = 5;
                console.log("page no: " + pageNr + " results per page: " + resultsPerPage + " type: " + type);
                var queryObject = {};
                if (req.params.category && req.params.category !== 'undefined')
                    //query = database.collection('product').find({category: req.params.category});
                    queryObject.category = req.params.category;
                if (type === 'low') // todo later on add filter on trending value
                    queryObject.trending = { $lt : 0 };
                else if (type === 'high')
                    queryObject.trending = { $gt : 0 };
                database.collection('product').find(queryObject)
                    .sort({trending : -1})
                    .skip(pageNr > 0 ? ((pageNr - 1) * resultsPerPage) : 0)
                    .limit(resultsPerPage)
                    .toArray(function (err, docs) {
                        console.log('findProductsTrending: ' + docs);
                        res.jsonp(docs);
                    });
            }, function (reason) {
                // handle onRejected
                // todo build custom error handler -> http://expressjs.com/guide/error-handling.html
                console.log(reason);
            }
        );
    },
    saveProducts: function (json) {
        Database.connect().done(function (database) {
                // this is really annoying but must be done to keep track of trending -> is there any other way
                json.forEach(function (doc, index, array) {
                    database.collection('product')
                        .find({name: doc.name})
                        .limit(1)
                        .project({price: 1, trending: 1})
                        .next(function (err, resDoc) {
                            var trending;
                            if (err) {
                                //todo if not found then upsert
                            } else if (resDoc && resDoc.price) {
                                if (doc.price != resDoc.price) {
                                    trending = (doc.price - resDoc.price) / resDoc.price;
                                    trending = Math.round(trending * 100);
                                } else {
                                    trending = resDoc.trending;
                                }
                            }
                            database.collection('product').findOneAndUpdate({name: doc.name}, {
                                $addToSet : {
                                    history: {
                                        price: doc.price,
                                        dateRecorded: DateUtil.getCurrentDate()
                                    }
                                },
                                $set  : {
                                    name: doc.name,
                                    pid: doc.pid,
                                    price : doc.price,
                                    currency: doc.currency,
                                    category: doc.category,
                                    productLink: doc.productLink,
                                    imageLink: doc.imageLink,
                                    ratingScore: doc.ratingScore,
                                    nrRatings: doc.nrRatings,
                                    active: doc.active,
                                    details: doc.details,
                                    trending: trending
                                }
                            }, { returnOriginal: false, upsert : true }, function (err, res) {
                                if (err) {
                                    //todo error handling
                                    console.log(err);
                                }
                            });
                        });
                });
            }, function (reason) {
                // handle onRejected
                // todo build custom error handler -> http://expressjs.com/guide/error-handling.html
                console.log(reason);
            }
        );
    },
    /**
     * This was used before introducing trending.
     * Unfortunately bulk updates do not really allow modification based on the old value.
     *
     * @param json product documents resulted from scanning
     */
    saveBulkProducts: function (json) {
        if (json.length) {
            // establish connection to db
            Database.connect().done(function (database) {
                    console.log("Started bulk update");
                    // get (create) the collection
                    var col = database.collection('product');
                    // initialize the unordered batch
                    var batch = col.initializeUnorderedBulkOp();
                    // iterate documents to update
                    json.forEach(function (doc, index, array) {
                        // update product entry if found, appending current price to history, else freshly insert new product
                        batch.find({name: doc.name}).upsert().updateOne(
                            {
                                $addToSet : {
                                    history: {
                                        price: doc.price,
                                        dateRecorded: DateUtil.getCurrentDate()
                                    }
                                },
                                $set  : {
                                    name: doc.name,
                                    pid: doc.pid,
                                    price : doc.price,
                                    currency: doc.currency,
                                    category: doc.category,
                                    productLink: doc.productLink,
                                    imageLink: doc.imageLink,
                                    ratingScore: doc.ratingScore,
                                    nrRatings: doc.nrRatings,
                                    active: doc.active,
                                    details: doc.details
                                }
                            }
                        );
                    });

                    // execute the operations, set journal concern to 1 to enable logging
                    batch.execute({w: 0, j: 1}, function (err, result) {
                        if (err)
                            console.log(err);
                        else
                            console.log("Finished bulk update -> matched: " + result.nMatched+ ", inserted: " + result.nInserted
                                + ", upserted: " + result.nUpserted + ", modified: " + result.nModified + ", removed: " + result.nRemoved);
                    });
                }, function (reason) {
                    // handle onRejected
                    // todo build custom error handler -> http://expressjs.com/guide/error-handling.html
                    console.log(reason);
                }
            );
        }
    }
};

module.exports = Product;