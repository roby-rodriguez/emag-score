/**
 * Created by robaa on 02.07.2015.
 */
angular.module('emagScoreApp')
    .controller('FavoritesController', function($scope, $log, ProductService, HomeFactory, ProductFactory, AuthFactory) {
        $scope.getTab = function () {
            return HomeFactory.getTab();
        };
        $scope.getProducts = function () {
            return ProductFactory.getProducts();
        };
        $scope.getPaginator = function () {
            return ProductFactory.getPaginator();
        };

        $scope.pageChanged = function() {
            $log.log("Changed to 2: " + ProductFactory.getPaginator().currentPage);
            ProductFactory.refreshProducts();
        };

        $scope.ratingStyleClass = function(ratingScore, index) {
            if (ratingScore >= (index + 1) * 20)
                return 'fa fa-star';
            else if (ratingScore > index * 20)
                return 'fa fa-star-half-o';
            else
                return 'fa fa-star-o';
        };

        $scope.setProduct = function(data) {
            ProductFactory.setProduct(data);
        };

        $scope.removeFavorite = function (data) {
            ProductService.removeFavorite(data.pid, function (info) {
                $scope.info = info;
            }).error(function (err) {
                $scope.error = err;
            });
        };
        
        ProductFactory.toggleProductFavorite(AuthFactory.currentUser());
        ProductFactory.refreshProducts();
    });