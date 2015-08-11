/**
 * Controller for category view
 *
 * Links:
 * http://stackoverflow.com/questions/9293423/can-one-controller-call-another
 */
angular.module('emagScoresApp').controller('CategoryController', function($rootScope, $scope, CategoryService, CategoryFactory) {
    $scope.categories = [];

    $scope.setCategory = function(data) {
        CategoryFactory.setCategory(data);
        $scope.$emit('categoryChanged', []);
    };

    CategoryService.retrieveCategories()
        .then(function (json) {
            // promise fulfilled
            $scope.categories = json;
        }, function(error) {
            // display error message in UI
        });
});