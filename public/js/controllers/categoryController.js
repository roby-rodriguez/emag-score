/**
 * Controller for category view
 *
 * Links:
 * http://stackoverflow.com/questions/9293423/can-one-controller-call-another
 * http://stackoverflow.com/questions/14502006/working-with-scope-emit-and-on
 */
angular.module('emagScoresApp').controller('CategoryController', function($rootScope, $scope, CategoryService, CategoryFactory) {
    $scope.categories = [];

    $scope.setCategory = function(data) {
        CategoryFactory.setCategory(data);
        $rootScope.$broadcast('categoryChanged', []);
    };

    CategoryService.retrieveCategories()
        .then(function (json) {
            // promise fulfilled
            $scope.categories = json;
        }, function(error) {
            // display error message in UI
        });
});