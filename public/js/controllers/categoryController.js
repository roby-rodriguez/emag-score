/**
 * Controller for category view
 *
 * Links:
 * http://stackoverflow.com/questions/9293423/can-one-controller-call-another
 * http://stackoverflow.com/questions/14502006/working-with-scope-emit-and-on
 */
angular.module('emagScoresApp').controller('CategoryController', function($rootScope, $scope, CategoryService, CategoryFactory) {
    $scope.categories = [];
    $scope.collapsed = true;

    $scope.setCategory = function(data) {
        CategoryFactory.setCategory(data);
        $rootScope.$broadcast('categoryChanged', []);
    };

    $scope.getCategoryClass = function(index, addition) {
        // todo parametrise constant by checking out device display size
        if ($scope.collapsed && index > 5)
            return 'hidden';
        if (typeof addition !== 'undefined')
            return 'nav' + addition;
        return 'nav';
    }

    $scope.getToggleClass = function() {
        if ($scope.collapsed)
            return 'fa fa-fw fa-chevron-down';
        return 'fa fa-fw fa-chevron-up';
    }
    
    $scope.toggleShowCategories = function () {
        $scope.collapsed = !$scope.collapsed;
    }

    CategoryService.retrieveCategories()
        .then(function (json) {
            // promise fulfilled
            $scope.categories = json;
        }, function(error) {
            // display error message in UI
        });
});