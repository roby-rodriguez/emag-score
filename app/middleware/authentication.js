/**
 * Created by johndoe on 20.09.2015.
 */
var jwt     = require('jsonwebtoken');
var User    = require('../model/user');

//FIXME fix this bullshit
var passport        = require('passport');
require('../config/passport')(passport);

var Authentication = {
    login: function (req, res, next) {
        if (!req.body.email || !req.body.password)
            return res.status(401).json({message: 'Empty credentials'});

        passport.authenticate('local', function (err, user, info) {
            if (err) return next(err);

            if (user) {
                User.checkPassword(user, req.body.password, function (err, match) {
                    if (err) return next(err);
                    if (match) return res.json({token: generateToken(user)});
                    return res.status(401).json({message: 'Invalid credentials'});
                });
                //see http://stackoverflow.com/questions/7042340/node-js-error-cant-set-headers-after-they-are-sent#answer-31217209
                return;
            }
            return res.status(401).json(info);

        })(req, res, next);
    },
    //TODO do we really need this?
    logout: function (req, res) {
        req.logout();
        // return res.redirect('/');
    },
    register: function (req, res, next) {
        if (!req.body.email || !req.body.password)
            return res.status(401).json({message: 'Empty credentials'});

        User.findById(req.body.email, function (err, user) {
            // in case of errors return them
            if (err) return next(err);
            //TODO add email valid check and password length
            // check if user already exists, otherwise create it
            if (user) {
                return res.status(401).json({message: 'User already exists'});
            } else {
                User.saveUser({
                    email: req.body.email,
                    password: req.body.password
                }, function (err, newUser) {
                    if (err) return next(err);
                    return res.json({ token: generateToken(newUser) });
                });
            }
        });
    }
};

function generateToken(user) {
    var expires = new Date();
    expires.setDate(expires.getDate() + 30);
    return jwt.sign({
        email: user.email,
        exp: parseInt(expires.getTime() / 1000)
    }, require('../config/generated/env').SESSION_SECRET);
}

module.exports = Authentication;