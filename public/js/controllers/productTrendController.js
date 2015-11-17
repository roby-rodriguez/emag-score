/**
 * Created by johndoe on 12.11.2015.
 */
//todo the entire code is duplicate -> needs refactoring
angular.module('emagScoreApp')
    .controller('ProductTrendController', function($scope, $log, ProductService, HomeFactory, ProductFactory) {
        $scope.getTab = function () {
            return HomeFactory.getTab();
        };
        $scope.getProducts = function () {
            // lazy load products on category change
            if (ProductFactory.isDirty()) {
                //todo add category to scope and pass as second parameter
                $scope.retrieveTotalNrOfProducts(HomeFactory.getTab().link, undefined);
                // reset pagination
                ProductFactory.setCurrentPage(1);
                $scope.displayProducts();
                ProductFactory.setDirty(false);
            }
            return ProductFactory.getProducts();
        };
        $scope.getPaginator = function () {
            return ProductFactory.getPaginator();
        };

        $scope.pageChanged = function() {
            $log.log("Changed to 2: " + ProductFactory.getPaginator().currentPage);
            $scope.displayProducts();
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

        $scope.addFavorite = function (data) {
            ProductService.addFavorite(data.pid, function (info) {
                $scope.info = info;
            }).error(function (err) {
                $scope.error = err;
            });
        };

        $scope.displayProducts = function () {
            // todo add category as second param
            ProductService.retrieveTrendingProducts($scope.getTab().link, undefined, ProductFactory.getPaginator().currentPage, ProductFactory.getPaginator().resultsPerPage)
                .then(function (json) {
                    // promise fulfilled
                    ProductFactory.setProducts(json);
                }, function(error) {
                    // display error message in UI
                });
        };

        $scope.retrieveTotalNrOfProducts = function (type, keyword) {
            ProductService.retrieveTotalNrOfProducts({ type : type, keyword : keyword })
                .then(function (total) {
                    // promise fulfilled
                    ProductFactory.setTotalPages(total);
                }, function(error) {
                    // display error message in UI
                });
        };
    });