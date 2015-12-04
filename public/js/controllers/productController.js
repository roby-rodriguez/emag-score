/**
 * Controller for the product view
 *
 * Links:
 * http://blog.nebithi.com/angularjs-dos-and-donts/
 *
 * Problems:
 * http://stackoverflow.com/questions/12618342/ng-model-does-not-update-controller-value
 * http://stackoverflow.com/questions/18880737/how-do-i-use-rootscope-in-angular-to-store-variables
 * Each time a ng-controller is found, another $scope is created, which is why $rootScope is sometimes necessary
 * http://stackoverflow.com/questions/27770402/ng-repeat-not-updating-after-array-update#answer-27771130
 *
 * TODO controllers tend to clutter unnecessary business logic, refactor to utilities/services
 */
angular.module('emagScoreApp')
    .controller('ProductController', function($rootScope, $scope, $log, ProductService, ProductFactory, CategoryFactory) {

        $scope.getCategory = function () {
            return CategoryFactory.getCategory();
        };
        $scope.getProducts = function () {
            // lazy load products on category change
            if (ProductFactory.isDirty()) {
                $scope.init();
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
            ProductService.retrieveProducts(CategoryFactory.getCategory().name, ProductFactory.getPaginator().currentPage, ProductFactory.getPaginator().resultsPerPage)
                .then(function (json) {
                    // promise fulfilled
                    // $scope.products = json;
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

        $scope.init = function () {
            $scope.retrieveTotalNrOfProducts('category', CategoryFactory.getCategory().name);
            // reset pagination
            ProductFactory.setCurrentPage(1);
            $scope.displayProducts();
            ProductFactory.setDirty(false);
        };
        $scope.init();
});