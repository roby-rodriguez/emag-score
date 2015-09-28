/**
 * Factory for creating the 'product' object that is used for product.html
 *
 * Links:
 * http://stackoverflow.com/questions/22408790/angularjs-passing-data-between-pages
 * http://stackoverflow.com/questions/12574765/better-design-for-passing-data-to-other-ng-views-and-persisting-it-across-contr
 */
angular.module('emagScoreApp').factory('ProductFactory', function() {
    var product = {};

    return {
        setProduct: function(data) {
            product = data;
        },
        getProduct: function() {
            return product;
        }
    };
});