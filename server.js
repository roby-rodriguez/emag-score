// server.js
// check out https://scotch.io/tutorials/build-a-restful-api-using-node-and-express-4

/**
Problems so far:
    - structure the project, see following links:
    https://scotch.io/tutorials/node-and-angular-to-do-app-application-organization-and-structure
    http://stackoverflow.com/questions/13998793/structuring-a-nodejs-and-angular-js-app
    http://stackoverflow.com/questions/14417592/node-js-difference-between-req-query-and-req-params

    SPAs:
    https://scotch.io/tutorials/setting-up-a-mean-stack-single-page-application
    Communication through files done by means of module.export, see:
    http://openmymind.net/2012/2/3/Node-Require-and-Exports/
*/

// setup modules
var express  = require('express');
var app      = express();
var Product  = require('./app/model/product');
var Scanner  = require('./app/business/scan');

// setup routing
var router = express.Router();

router.get('/', function(req, res) {
   res.json({"message" : "Hello world!"});
});

/*
    REST api
    http://localhost:1337/api/products
    http://localhost:1337/api/products/:prod_id
 */
router.get('/products', Product.findAllProducts);
router.get('/products/:title', Product.findProductsByTitle);

// register routes -> all routes will be prefixed with /api
app.use('/', router);
// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public'));

app.listen(1337);
console.log("Magic happens on port 1337...");

//Scanner.rescan('telefoane-mobile');
//console.log("all products: " + Scanner.products);
Product.testSaveBulkProducts();