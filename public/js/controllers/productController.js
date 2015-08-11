/**
 * Controller for the product view
 *
 * Links:
 * http://blog.nebithi.com/angularjs-dos-and-donts/
 *
 * Problems:
 * http://stackoverflow.com/questions/12618342/ng-model-does-not-update-controller-value
 * Each time a ng-controller is found, another $scope is created, which is why $rootScope is sometimes necessary
 * http://stackoverflow.com/questions/27770402/ng-repeat-not-updating-after-array-update#answer-27771130
 *
 * TODO controllers tend to clutter unnecessary business logic, refactor to utilities/services
 */
angular.module('emagScoresApp').controller('ProductController', function($rootScope, $scope, $log, ProductFactory, ProductService, CategoryFactory) {
    //TODO products doesn't have to be on root scope
    $rootScope.products = [];
    $rootScope.paginator = {
        maxPages: 5,
        currentPage: 1,
        resultsPerPage: 5
    };

    $scope.pageChanged = function() {
        $log.log("Changed to 2: " + $scope.paginator.currentPage);
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
    $rootScope.displayProducts = function () {
        $scope.subcategory = CategoryFactory.getCategory();
        ProductService.retrieveProducts($scope.subcategory.name, $scope.paginator.currentPage, $scope.paginator.resultsPerPage)
            .then(function (json) {
                // promise fulfilled
                $rootScope.products = json;
            }, function(error) {
                // display error message in UI
            });
    };

    CategoryFactory.initCategory(function (data) {
        $scope.subcategory = data;
        ProductService.retrieveTotalNrOfProducts($scope.subcategory.name)
            .then(function (total) {
                // promise fulfilled
                $rootScope.paginator.total = total;
                $scope.displayProducts();
            }, function(error) {
                // display error message in UI
            });
    });

    $scope.$on('categoryChanged', function () {
        $scope.displayProducts();
    });
});