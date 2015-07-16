/**
 * Controller for the home view
 *
 * TODO controllers tend to clutter unnecessary business logic, refactor to utilities/services
 */
angular.module('emagScoresApp').controller('HomeController', function($scope, ProductFactory, ProductService) {
    var vm = this;

    vm.ratingStyleClass = function(ratingScore, index) {
        if (ratingScore >= (index + 1) * 20)
            return 'fa fa-star';
        else if (ratingScore > index * 20)
            return 'fa fa-star-half-o';
        else
            return 'fa fa-star-o';
    };

    vm.setProduct = function(data) {
        ProductFactory.setProduct(data);
    };

    vm.emagBase = "http://www.emag.ro";
    $scope.displayProducts = function () {
        ProductService.retrieveProducts()
            .then(function (json) {
                // promise fulfilled
                vm.products = json;
            }, function(error) {
                // display error message in UI
        });
    };
    $scope.displayProducts();
});