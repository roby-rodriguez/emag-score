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
angular.module('emagScoresApp')
    .run(function ($rootScope) {
        //TODO products doesn't have to be on root scope
        $rootScope.products = [];
        $rootScope.paginator = {
            maxPages: 5,
            currentPage: 1,
            resultsPerPage: 5
        };
    })
    .controller('ProductController', function($rootScope, $scope, $log, ProductFactory, ProductService, CategoryFactory) {
        // current active browse type -> category nav/search
        $scope.type = '';
        $scope.search = { keyword : '' };
        $scope.searchInputEnter = function (keyEvent) {
            if (keyEvent.which === 13) {
                $scope.type = 'title';
                $scope.retrieveTotalNrOfProducts($scope.type, $scope.search.keyword);
                // reset pagination
                $rootScope.paginator.currentPage = 1;
                $scope.displaySearchProducts();
            }
        };

        $scope.pageChanged = function() {
            $log.log("Changed to 2: " + $rootScope.paginator.currentPage);
            if ($scope.type === 'title')
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

        $scope.emagBase = "http://www.emag.ro";
        $scope.displayProducts = function () {
            ProductService.retrieveProducts($scope.subcategory.name, $rootScope.paginator.currentPage, $rootScope.paginator.resultsPerPage)
                .then(function (json) {
                    // promise fulfilled
                    $rootScope.products = json;
                }, function(error) {
                    // display error message in UI
                });
        };
        $scope.displaySearchProducts = function () {
            ProductService.searchProducts($scope.search.keyword, $rootScope.paginator.currentPage, $rootScope.paginator.resultsPerPage)
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

/*        CategoryFactory.initCategory(function (data) {
            $scope.subcategory = data;
            $scope.retrieveTotalNrOfProducts('category', $scope.subcategory.name);
        });*/

        /**
         * Listens to category changed events coming from category view
         */
        $scope.$on('categoryChanged', function () {
            $scope.type = 'category';
            $scope.subcategory = CategoryFactory.getCategory();
            $scope.retrieveTotalNrOfProducts($scope.type, $scope.subcategory.name);
            // reset pagination
            $rootScope.paginator.currentPage = 1;
            $scope.displayProducts();
        });
});