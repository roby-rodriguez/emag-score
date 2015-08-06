/**
 * Category document model.
 */
var Database  = require('./database');

var Category = {
    findAllCategoriess: function(req, res) {
        // for large amounts of documents skip() is slow, use http://stackoverflow.com/a/7230040
        Database.connect().done(function (database) {
            var pageNr = req.params.pageNr;
            var resultsPerPage = parseInt(req.params.resultsPerPage);
            if (isNaN(resultsPerPage)) resultsPerPage = 5;
            console.log("page no: " + pageNr + " results per page: " + resultsPerPage);
            database.collection('category').find()
                .skip(pageNr > 0 ? ((pageNr - 1) * resultsPerPage) : 0)
                .limit(resultsPerPage)
                .toArray(function (err, docs) {
                    console.log('findAllCategoriess: ' + docs);
                    res.jsonp(docs);
                });
            }, function (reason) {
                // handle onRejected
                console.log(reason);
            }
        );
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
                    batch.find({name: doc.name}).upsert().updateOne(
                        {
                            $set  : {
                                name: doc.name,
                                title: doc.title,
                                parent: doc.parent
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