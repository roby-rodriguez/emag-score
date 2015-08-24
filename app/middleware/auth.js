/**
 * Created by johndoe on 22.08.2015.
 *
 * Links:
 * http://thejackalofjavascript.com/architecting-a-restful-node-js-app/
 */
var jwt  = require('jwt-simple');
var User = require('../model/User');

var Auth = {
    login: function (req, res) {
        var email = req.body.email || '';
        var password = req.body.password || '';

        if (email == '' || password == '') {
            res.status(401);
            res.json({
                "status": 401,
                "message": "Invalid credentials"
            });
            return;
        }

        User.findByCredentials(email, password, function (user) {
            if (!user) {
                res.status(401);
                res.json({
                    "status": 401,
                    "message": "Invalid credentials"
                });
                return;
            } else {
                res.json(generateToken(user));
            }
        });
    }
};

function generateToken(user) {
    var expires = expiresIn(7); // 7 days
    var token = jwt.encode({
        exp: expires
    }, require('../config/secret')());

    return {
        token: token,
        expires: expires,
        user: user
    };
}

function expiresIn(numDays) {
    var dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
}

module.exports = Auth;