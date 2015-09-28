/**
 * Created by johndoe on 11.09.2015.
 */
// load passport strategies
var LocalStrategy = require('passport-local').Strategy;
// load user data model
var User = require('../model/user');

// expose middleware
module.exports = function(passport) {
    /**
     * serialize the user for the session
     */
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    /**
     * deserialize the user
     */
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
    passport.use('local', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        }, function (email, password, next) {
            User.findById(email, function (err, user) {
                // in case of errors return them
                if (err) return next(err);
                // check if user exists, then check password
                if (!user) {
                    return next(null, false, { message: 'Invalid credentials' });
                }
                return next(null, user);
            });
        })
    );
};