/**
 * Created by robaa on 10.07.2015.
 */
/**
 * Links:
 * http://stackoverflow.com/questions/22408790/angularjs-passing-data-between-pages
 * http://stackoverflow.com/questions/12574765/better-design-for-passing-data-to-other-ng-views-and-persisting-it-across-contr
 */
angular.module('emagScoresApp').factory('ProductFactory', function() {
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