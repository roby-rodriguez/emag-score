/**
 * Factory for creating the 'product' object that is used for product.html
 *
 * Links:
 * http://stackoverflow.com/questions/22408790/angularjs-passing-data-between-pages
 * http://stackoverflow.com/questions/12574765/better-design-for-passing-data-to-other-ng-views-and-persisting-it-across-contr
 */
angular.module('emagScoreApp').factory('ProductFactory', function() {
    var product = {};
    var products = [];
    var paginator = {
        maxPages: 5,
        currentPage: 1,
        resultsPerPage: 5
    };

    return {
        setProduct: function(data) {
            product = data;
        },
        getProduct: function() {
            return product;
        },
        setProducts: function(data) {
            products = data;
        },
        getProducts: function() {
            return products;
        },
        setTotalPages: function (total) {
            paginator.total = total;
        },
        setCurrentPage: function (currentPage) {
            paginator.currentPage = currentPage;
        },
        getPaginator: function() {
            return paginator;
        }
    };
});