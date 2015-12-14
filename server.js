/**
 * Emag-score application server main entry point.
 * Mainly deals with configuration & routing.
 *
 * todo adjust bodyParser to http://stackoverflow.com/questions/5710358/how-to-get-post-a-query-in-express-js-node-js#answer-20132867
 * Created by johndoe on 23.08.2015.
 */

// setup modules
var express         = require('express');
var logger          = require('morgan');
var bodyParser      = require('body-parser');
var cookieParser    = require('cookie-parser');
var passport        = require('passport');
var session         = require('express-session');
var jwt             = require('express-jwt');
var favicon         = require('serve-favicon');
// setup express
var app             = express();

require('./app/config/passport')(passport);

// log all requests with morgan
app.use(logger('dev'));
// use middleware to parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// required for passport
app.use(session({
    secret: require('./app/config/generated/env').SESSION_SECRET,
    //cookie: { secure: true }, // https needed for this option
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//
app.use(favicon(__dirname + '/public/resources/img/favicon.ico'));
// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public'));

// Cross-origin resource sharing (CORS) headers
app.all('/*', function (req, res, next) {
    // allow any origin
    res.header("Access-Control-Allow-Origin", "*");
    // allow only these methods
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // custom headers for CORS
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key,Authorization');
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});

/*
    Authentication/validation middleware
    - check if token sent by client is valid
    - applies only to secured routes (i.e. which require login)
 */
// app.all('/secured/*', require('./app/middleware/validation'));
app.all('/secured/*', jwt({secret: require('./app/config/generated/env').SESSION_SECRET}));
// load app routing
app.use('/', require('./app/routing/route'));
// if no route matched so far reply with 404
app.use(function (req, res, next) {
    var err = new Error('Not found');
    err.status = 404;
    next(err);
});

process.env.PORT = process.env.PORT || 1337;
process.env.IP = process.env.IP || 'localhost';

// start server
app.listen(process.env.PORT, process.env.IP, function () {
    console.log("Magic happens on port " + process.env.PORT + "...");
});

//require('./app/business/scan').scanEverything(function () {});
//require('./app/business/scan').scanCategories();