/**
 * User document model.
 *
 * Created by johndoe on 22.08.2015.
 */
var Database  = require('./database');

var User = {
    findByCredentials: function (email, password, callback) {
        console.log('findProductsByTitle: ' + req.params.title);
        Database.connect().done(function (database) {
                database.collection('user')
                    .findOne({email: email, password: password}, function (err, doc) {
                        if (err) {
                            console.log('Error: ' + err);
                        } else {
                            console.log('found: ' + doc);
                        }
                        callback(doc);
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