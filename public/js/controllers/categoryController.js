/**
 * Controller for category view
 */
angular.module('emagScoresApp').controller('CategoryController', function($rootScope, $scope, CategoryService, CategoryFactory) {
    $scope.categories = [];

    $scope.setCategory = function(data) {
        CategoryFactory.setCategory(data);
    };

    CategoryService.retrieveCategories()
        .then(function (json) {
            // promise fulfilled
            $scope.categories = json;
        }, function(error) {
            // display error message in UI
        });
});