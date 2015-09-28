/**
 * User document model.
 *
 * Created by johndoe on 22.08.2015.
 */
var Database    = require('./database');
var bcrypt      = require('bcrypt');

var User = {
    checkPassword: function (user, password, callback) {
        bcrypt.compare(password, user.password, function (err, match) {
            callback(err, match);
        });
    },
    findByCredentials: function (email, password, callback) {
        console.log('User.findByCredentials: ' + email  + " " + password);
        Database.connect().done(function (database) {
                database.collection('user')
                    .findOne({email: email, password: password}, function (err, doc) {
                        if (err) {
                            console.log('Error: ' + err);
                        } else {
                            console.log('Found: ' + doc);
                        }
                        callback(err, doc);
                    });
            }, function (reason) {
                // handle onRejected
                // todo build custom error handler -> http://expressjs.com/guide/error-handling.html
                console.log(reason);
            }
        );
    },
    findById: function (id, callback) {
        console.log('User.findById: ' + id);
        Database.connect().done(function (database) {
                database.collection('user')
                    .findOne({email: id}, function (err, doc) {
                        if (err) {
                            console.log('Error: ' + err);
                        } else {
                            console.log('Found: ' + doc);
                        }
                        callback(err, doc);
                    });
            }, function (reason) {
                // handle onRejected
                // todo build custom error handler -> http://expressjs.com/guide/error-handling.html
                console.log(reason);
            }
        );
    },
    saveUser: function (userDoc, callback) {
        console.log('User.saveUser: ' + userDoc);
        Database.connect().done(function (database) {
                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(userDoc.password, salt, function (err, hash) {
                        userDoc.password = hash;

                        database.collection('user')
                            .insertOne(userDoc, function (err, insertRes) {
                                callback(err, insertRes.insertedCount == 1 ? userDoc : null);
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
    addFavorite: function(req, res, next) {
        console.log('User.addFavorite: ' + req.body.pid + ' by ' + req.body.email);
        Database.connect().done(function (database) {
                database.collection('product')
                    //TODO add request parameter
                    .findOne({pid: req.body.pid}, function (err, product) {
                        if (err) {
                            console.log('Error: ' + err);
                            return res.status(400).send({message: 'User not found'});
                        } else if (product) {
                            database.collection('user')
                                .updateOne(
                                    {
                                        email: req.body.email
                                    },
                                    {
                                        $addToSet : {
                                            favorites: {
                                                product: product
                                            }
                                        }
                                    }
                                , function (err, updateRes) {
                                    if (err) {
                                        console.log('Error: ' + err);
                                        next(err);
                                    } else {
                                        console.log('Updated: ' + updateRes);
                                        var status = (updateRes.modifiedCount) ? 'added' : 'already exists';
                                        return res.json({message: 'Favorite ' + status});
                                    }
                                });
                        } else {
                            return res.status(400).send({message: 'Product not found'});
                        }
                    });
            }, function (reason) {
                // handle onRejected
                // todo build custom error handler -> http://expressjs.com/guide/error-handling.html
                console.log(reason);
                return res.status(400).send({message: reason});
            }
        );
    },
    findAllFavorites: function(req, res) {
        Database.connect().done(function (database) {
                // var pageNr = req.params.pageNr;
                // var resultsPerPage = parseInt(req.params.resultsPerPage);
                // if (isNaN(resultsPerPage)) resultsPerPage = 5;
                // console.log("page no: " + pageNr + " results per page: " + resultsPerPage);
                database.collection('user').find()
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
    }
};

module.exports = User;