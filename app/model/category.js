/**
 * Category document model.
 */
var Database  = require('./database');

var Category = {
    getCategories: function (callback, finishedCallback) {
        Database.connect().done(function (database) {
                database.collection('category').find()
                    .toArray(function (err, docs) {
                        callback(docs, finishedCallback);
                    });
            }, function (reason) {
                // handle onRejected
                // todo build custom error handler -> http://expressjs.com/guide/error-handling.html
                console.log(reason);
            }
        );
    },
    findAllCategories: function(req, res) {
        Database.connect().done(function (database) {
            database.collection('category').aggregate(
                [
                    {$unwind: "$subcategories"},
                    {$group:
                        {
                            // or simply use _id:"$title", instead of the next two lines
                            _id:"$_id",
                            title: {$first : "$title"},
                            size: {$sum:1},
                            subcategories: {$push:"$subcategories"}
                        }
                    },
                    {$sort: {size:-1}}
                ], function (err, docs) {
                    console.log('findAllCategories (sort by nr of subcategories): ' + docs.length);
                    /* docs.forEach(function (doc, index, array) {
                        console.log(doc.title);
                        doc.subcategories.forEach(function (doc, index, array) {
                            console.log("\t" + doc.title);
                        });
                    }); */
                    res.jsonp(docs);
                }
            );
        });
    },
    saveBulkCategories: function (json) {
        // establish connection to db, for some reason calling then() isn't enough to get a full-fledged db object
        Database.connect().done(function (database) {
                // handle onFulfilled
                // get (create) the collection
                var col = database.collection('category');
                // initialize the unordered batch
                var batch = col.initializeUnorderedBulkOp();
                // iterate documents to update
                json.forEach(function (doc, index, array) {
                    // update entry if found, else freshly insert new entry
                    batch.find({title: doc.title}).upsert().updateOne(
                        {
                            $set  : {
                                title: doc.title,
                                subcategories: doc.subcategories
                            }
                        }
                    );
                });
                // execute the operations, set journal concern to 1 to enable logging
                batch.execute({w: 0, j: 1}, function (err, result) {
                    if (err)
                        console.log(err);
                    else
                        console.log("DB bulk save (matched: " + result.nMatched + ", inserted: " + result.nInserted + ", upserted: " + result.nUpserted + ", modified: " + result.nModified + ", removed: " + result.nRemoved);
                });
            }, function (reason) {
                // handle onRejected
                // todo build custom error handler -> http://expressjs.com/guide/error-handling.html
                console.log(reason);
            }
        );
    },
    testSaveBulkCategories: function () {
        var categoriesString = '[{"name":"laptopuri-accesorii","title":"Laptopuri si accesorii"},{"name":"laptopuri","title":"Laptop / Notebook","parent":"laptopuri-accesorii"},{"name":"genti","title":"Genti","parent":"laptopuri-accesorii"}]';
        this.saveBulkCategories(JSON.parse(categoriesString));
    }
};

module.exports = Category;