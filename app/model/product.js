/**
 * Product document model.
 *
 * Start mongo first by running (for ex.):
 * C:\Program Files\MongoDB\Server\3.0\bin\mongod.exe
 *
 * Links:
 * http://docs.mongodb.org/manual/core/crud-introduction/
 * http://mongodb.github.io/node-mongodb-native/2.0/api/
 * http://christiankvalheim.com/post/the_new_bulk_api/
 * http://stackoverflow.com/questions/26924221/mongodb-journal-in-write-concern
 * http://stackoverflow.com/questions/5373198/mongodb-relationships-embed-or-reference
 */
// you first have to enable 'emagscores-dev' by use in mongo shell
//TODO use MongoClient https://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#mongoclient-connection-pooling
var mongo = require('mongodb'),
    db = new mongo.Db('emagscores-dev', new mongo.Server('localhost', 27017, {auto_reconnect: true, minPoolSize: 5}));

var Product = {
    findProductsByTitle: function(req, res) {
        console.log(req.params);
        console.log('findProductsByTitle: ' + req.params.title);
        db.collection('product').find({name: { $regex: req.params.title, $options: 'i'}}).toArray(function (err, docs) {
            console.log('found: ' + docs);
            res.jsonp(docs);
        });
    },
    findAllProducts: function(req, res) {
        db.collection('product').find().toArray(function (err, docs) {
            console.log('findAllProducts: ' + docs);
            res.jsonp(docs);
        });
    },
    saveBulkProducts: function (json) {
        // establish connection to db
        db.open(function(err, db) {
            // get (create) the collection
            var col = db.collection('product');
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
                            id: doc.id,
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
                    console.log("DB bulk save (matched: " + result.nMatched + ", inserted: " + result.nInserted + ", upserted: " + result.nUpserted + ", modified: " + result.nModified + ", removed: " + result.nRemoved);
            });
        });
    },
    testSaveBulkProducts: function () {
        var productsString = '[{"name":"Telefon mobil Samsung GALAXY S6 Edge, 32GB, Gold","id":554272,"price":5799.9,"brand":"Samsung","category":"Laptop, Tablete & Telefoane\/Telefoane mobile & accesorii\/Telefoane Mobile","variant":"Memorie interna:32 GB | Culoare:Auriu","dimension5":"100","list":"Telefoane Mobile","position":1},                                    {"name":"Telefon mobil Apple iPhone 6, 16GB, Space Grey","id":464909,"price":5599,"brand":"Apple","category":"Laptop, Tablete & Telefoane\/Telefoane mobile & accesorii\/Telefoane Mobile","variant":"Memorie interna:16 GB | Culoare:Gri","dimension5":"15%","list":"Telefoane Mobile","position":2}]';
        this.saveBulkProducts(JSON.parse(productsString));
    }
};

module.exports = Product;