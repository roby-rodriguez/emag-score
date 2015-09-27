/**
 * Exposes the routes of the public REST API.
 *
 * Created by johndoe on 23.08.2015.
 */
var express         = require('express');
var passport        = require('passport');
var Product         = require('../model/product');
var Category        = require('../model/category');
var User            = require('../model/user');
var Authentication  = require('../middleware/authentication');
var router          = express.Router();

/*
 * public accessible routes
 */
router.get('/', function(req, res) {
    res.render('index.html');
});
router.get('/products/retrieve/:pageNr/:resultsPerPage/:category', function(req, res) {
    Product.findAllProducts(req, res)
});
router.get('/products/retrieve/:pageNr/:resultsPerPage', function(req, res) {
    Product.findAllProducts(req, res)
});
router.get('/products/search/:pageNr/:resultsPerPage/:title', function(req, res) {
    Product.findProductsByTitle(req, res)
});
router.get('/products/total/category/:category', function(req, res) {
    Product.findTotalNrOfProducts(req, res)
});
router.get('/products/total/title/:title', function(req, res) {
    Product.findTotalNrOfProducts(req, res)
});
router.get('/categories', Category.findAllCategories);
router.post('/login', Authentication.login);
router.get('/logout', Authentication.logout);
router.post('/register', Authentication.register);

/*
 * routes available for only for authenticated & authorized users
 */
router.get('/secured/favorites/:userId/:pageNr/:resultsPerPage', function(req, res) {
    User.findAllFavorites(req, res)
});
router.post('/secured/favorites/add', function(req, res) {
    User.addFavorite(req, res)
});

module.exports = router;