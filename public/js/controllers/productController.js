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
    .run(function ($rootScope) {
        //TODO products doesn't have to be on root scope
        $rootScope.products = [];
        $rootScope.paginator = {
            maxPages: 5,
            currentPage: 1,
            resultsPerPage: 5
        };
        $rootScope.search = { keyword : '' };
    })
    .controller('ProductController', function($rootScope, $scope, $log, ProductFactory, ProductService, CategoryFactory) {
        // current active browse type -> category nav/search
        //$scope.type = '';
        $scope.searchInputEnter = function (keyEvent) {
            if (keyEvent.which === 13) {
                $rootScope.type = 'title';
                $scope.retrieveTotalNrOfProducts($rootScope.type, $rootScope.search.keyword);
                // reset pagination
                $rootScope.paginator.currentPage = 1;
                $scope.displaySearchProducts();
            }
        };

        $scope.pageChanged = function() {
            $log.log("Changed to 2: " + $rootScope.paginator.currentPage);
            if ($rootScope.type === 'title')
                $scope.displaySearchProducts();
            else
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

        $scope.emagBase = "http://www.emag.ro";
        $scope.displayProducts = function () {
            ProductService.retrieveProducts($rootScope.subcategory.name, $rootScope.paginator.currentPage, $rootScope.paginator.resultsPerPage)
                .then(function (json) {
                    // promise fulfilled
                    $rootScope.products = json;
                }, function(error) {
                    // display error message in UI
                });
        };
        $scope.displaySearchProducts = function () {
            ProductService.searchProducts($rootScope.search.keyword, $rootScope.paginator.currentPage, $rootScope.paginator.resultsPerPage)
                .then(function (json) {
                    // promise fulfilled
                    $rootScope.products = json;
                }, function(error) {
                    // display error message in UI
                });
        };
        $scope.retrieveTotalNrOfProducts = function (type, keyword) {
            ProductService.retrieveTotalNrOfProducts({ type : type, keyword : keyword })
                .then(function (total) {
                    // promise fulfilled
                    $rootScope.paginator.total = total;
                }, function(error) {
                    // display error message in UI
                });
        };

        /**
         * Listens to category changed events coming from category view
         */
        $scope.$on('categoryChanged', function () {
            $rootScope.type = 'category';
            $rootScope.subcategory = CategoryFactory.getCategory();
            $scope.retrieveTotalNrOfProducts($rootScope.type, $rootScope.subcategory.name);
            // reset pagination
            $rootScope.paginator.currentPage = 1;
            $scope.displayProducts();
        });
});