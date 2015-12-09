/**
 * Created by johndoe on 22.08.2015.
 *
 * Links:
 * http://thejackalofjavascript.com/architecting-a-restful-node-js-app/
 */
var jwt  = require('jwt-simple');
var User = require('../model/user');

var Auth = {
    login: function (req, res) {
        var email = req.body.email || '';
        var password = req.body.password || '';

        if (email == '' || password == '') {
            return reject(res);
        }

        User.findById(email, function (err, user) {
            if (err) throw err;
            if (!user) {
                console.log('User not found: ' + email);
                reject(res);
            } else if (user.password != password) {
                console.log('Wrong password: actual ' + password + ' expected ' + user.password);
                reject(res);
            } else {
                res.json(generateToken(user));
            }
        });
    }
};

function reject(res) {
    res.status(401);
    res.json({
        "status": 401,
        "message": "Invalid credentials"
    });
}

function generateToken(user) {
    var expires = expiresIn(require('../config/generated/env').TOKEN_VALIDITY);
    var token = jwt.encode({
        expires: expires,
        user: user.email
    }, require('../config/generated/env').SESSION_SECRET);
    return token;
}

function expiresIn(numDays) {
    var dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
}

module.exports = Auth;