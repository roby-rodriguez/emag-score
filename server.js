/**
 * Emag-score application server main entry point.
 * Mainly deals with configuration & routing.
 *
 * Created by johndoe on 23.08.2015.
 */

// setup modules
var express     = require('express');
var logger      = require('morgan');
var bodyParser  = require('body-parser');

var app         = express();

// log all requests with morgan
app.use(logger('dev'));
// use middleware to parse application/json
app.use(bodyParser.json());

// Cross-origin resource sharing (CORS) headers
app.all('/*', function (req, res, next) {
    // allow any origin
    res.header("Access-Control-Allow-Origin", "*");
    // allow only these methods
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // custom headers for CORS
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
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
app.all('/secured/*', [require('./app/middleware/validation')]);
// load app routing
app.use('/', require('./app/routing'));
// if no route matched so far reply with 404
app.use(function (req, res, next) {
    var err = new Error('Not found');
    err.status = 404;
    next(err);
});

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public'));
// start server
app.listen(1337, function () {
    console.log("Magic happens on port 1337...");
});