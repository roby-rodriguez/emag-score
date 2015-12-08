/**
 * Created by johndoe on 15.11.2015.
 */
angular.module('emagScoreApp')
    .controller('ProductSearchController', function($location, $scope, $log, ProductFactory, ProductSearchFactory, ProductService) {
        $scope.getProducts = function () {
            return ProductFactory.getProducts();
        };
        $scope.getPaginator = function () {
            return ProductFactory.getPaginator();
        };
        $scope.pageChanged = function() {
            $log.log("Changed to 2: " + ProductFactory.getPaginator().currentPage);
            //todo remove this type bullshit - use controller inheritance
            ProductFactory.refreshProducts();
        };
    });