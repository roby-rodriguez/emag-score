/**
 * Exposes the routes of the public REST API.
 *
 * Created by johndoe on 23.08.2015.
 */
var express  = require('express');
var Product  = require('../model/product');
var Category  = require('../model/category');
var router = express.Router();

/*
 * public accessible routes
 */
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

/*
 * routes available for only for authenticated & authorized users
 */

module.exports = router;