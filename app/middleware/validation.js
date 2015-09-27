/**
 * Created by johndoe on 23.08.2015.
 */
var jwt     = require('jwt-simple');
var User    = require('../model/user');

module.exports = function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
        try {
            var decoded = jwt.decode(token, require('../config/secret')());

            if (decoded.expires <= Date.now()) {
                return reject(res);
            }

            User.findByCredentials(decoded.user.email, decoded.user.password, function (err, user) {
                if (err) throw err;
                if (!user) {
                    console.log('User not found: ' + email);
                    reject(res);
                } else {
                    //TODO add handling for admin
                    next();
                }
            });
        } catch (err) {
            res.status(500);
            res.json({
                status: 500,
                message: "Oops! Something went wrong..",
                error: err
            });
        }
    } else {
        reject(res);
    }
};

function reject(res) {
    res.status(401);
    res.json({
        "status": 401,
        "message": "Invalid token"
    });
}