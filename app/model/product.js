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
// you first have to enable 'emagscores-dev' by  calling 'use emagscores-dev' in mongo shell
var Database  = require('./database');

var Product = {
    findProductsByTitle: function(req, res) {
        console.log('findProductsByTitle: ' + req.params.title);
        Database.connect().done(function (database) {
                database.collection('product')
                    .find({name: { $regex: req.params.title, $options: 'i'}})
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
                if (typeof req.params.category !== 'undefined')
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
                var query;
                if (typeof req.params.category !== 'undefined')
                    query = database.collection('product').find({category: req.params.category});
                else
                    query = database.collection('product').find();
                query.count(function (err, count) {
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
    saveBulkProducts: function (json) {
        // establish connection to db
        Database.connect().done(function (database) {
                console.log("Started bulk update for category " + json[0].category);
                // get (create) the collection
                var col = database.collection('product');
                // initialize the unordered batch
                var batch = col.initializeUnorderedBulkOp();
                // iterate documents to update
                json.forEach(function (doc, index, array) {
                    // update product entry if found, appending current price to history, else freshly insert new product
                    batch.find({name: doc.name}).upsert().updateOne(
                        {
                            $push : {
                                history: {
                                    price: doc.price,
                                    dateRecorded: new Date().toString()
                                }
                            },
                            $set  : {
                                name: doc.name,
                                pid: doc.pid,
                                price : doc.price,
                                currency: doc.currency,
                                brand: doc.brand,
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
                        console.log("DB bulk save (matched: " + result.nMatched + ", inserted: " + result.nInserted
                            + ", upserted: " + result.nUpserted + ", modified: " + result.nModified + ", removed: " + result.nRemoved);
                });
            }, function (reason) {
                // handle onRejected
                // todo build custom error handler -> http://expressjs.com/guide/error-handling.html
                console.log(reason);
            }
        );
    },
    testSaveBulkProducts: function () {
        var productsString = '[{ "name": "Telefon mobil Allview A6 Quad, Dual SIM, Black",  "id": "458986",  "price": 249.99,  "currency": "lei",  "brand": "Allview",  "category": "telefoane-mobile",  "productLink": "/telefon-mobil-allview-dual-sim-black-a6-quad/pd/DC5HRBBBM/",  "imageLink": "//s2emagst.akamaized.net/products/757/756172/images/res_c7cb4c519a82ec07194856be2d16ffa8_150x150_bblf.jpg",  "ratingScore": 81.4,  "nrRatings": 15,  "active": 1,  "details": "Vandut de eMAG" },{ "name": "Telefon mobil UTOK 351D, Dual SIM, Black",  "id": "414965",  "price": 169.99,  "currency": "lei",  "brand": "UTOK",  "category": "telefoane-mobile",  "productLink": "/telefon-mobil-utok-dual-sim-black-351d/pd/DYD0LBBBM/",  "imageLink": "//s1emagst.akamaized.net/products/636/635409/images/res_e2e2bb01117344df85a666cb6835ec1a_150x150_t5ir.jpg",  "ratingScore": 72,  "nrRatings": 57,  "active": 1,  "details": "Vandut de eMAG" },{ "name": "Telefon mobil Allview A4 You, Dual SIM, Black",  "id": "399047",  "price": 199.99,  "currency": "lei",  "brand": "Allview",  "category": "telefoane-mobile",  "productLink": "/telefon-mobil-allview-dual-sim-black-a4-you/pd/DX1HCBBBM/",  "imageLink": "//s4emagst.akamaized.net/products/608/607117/images/res_6d1287cc19e9f94287452d90915bbacd_150x150_j72n.jpg",  "ratingScore": 69.8,  "nrRatings": 191,  "active": 1,  "details": "2 oferte disponibile" },{ "name": "Telefon mobil UTOK D40XS, Dual SIM, Black",  "id": "12885266",  "price": 229.9,  "currency": "lei",  "brand": "UTOK",  "category": "telefoane-mobile",  "productLink": "/telefon-mobil-utok-d40xs-dual-sim-black-d40xs-black/pd/DNBCSMBBM/",  "imageLink": "//s1emagst.akamaized.net/products/1450/1449197/images/res_e62098eecb284338b98039ae87d366b9_150x150_4pgq.jpg",  "ratingScore": 93.4,  "nrRatings": 12,  "active": 1,  "details": "Vandut de Flanco" }]';
        this.saveBulkProducts(JSON.parse(productsString));
    }
};

module.exports = Product;