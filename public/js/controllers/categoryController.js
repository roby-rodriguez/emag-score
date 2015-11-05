/**
 * Controller for category view
 *
 * Links:
 * http://stackoverflow.com/questions/9293423/can-one-controller-call-another
 * http://stackoverflow.com/questions/14502006/working-with-scope-emit-and-on
 * stackoverflow.com/questions/18775011/angular-how-can-i-watch-a-filter-result-array-for-changes-from-the-controller#answer-18775306
 * stackoverflow.com/questions/16050533/how-can-i-obtain-the-result-array-of-an-angular-filter-expression-in-a-varia#answer-16050534
 */
angular.module('emagScoreApp').controller('CategoryController', function($rootScope, $scope, CategoryService, CategoryFactory) {
    var MAX_VISIBLE_CATEGORIES = 3;
    $scope.search = {};
    $scope.categories = [];
    //$scope.filteredCategories = [];
    $scope.collapsed = true;

    /**
     * Sets category on click using factory and broadcasts a changed event
     * to product controller
     *
     * @param data new category
     */
    $scope.setCategory = function(data) {
        CategoryFactory.setCategory(data);
        $rootScope.$broadcast('categoryChanged', []);
    };

    /**
     * Interceptor function for filter category
     *
     * @param filteredCategories filtered categories
     * @returns {*} filtered categories
     */
    $scope.interceptFilter = function (filteredCategories) {
        if (filteredCategories.length <= MAX_VISIBLE_CATEGORIES) {
            filteredCategories.forEach(function (doc) {
                $('#' + doc._id).collapse('show');
            });
        }
        return filteredCategories;
    };

    /**
     * Watch set on category search input value, collapses category
     * navigation list when empty
     */
    $scope.$watch('search.keyword', function (newVal, oldVal) {
        if (newVal !== undefined && newVal.length === 0) {
            $('ul.collapse').each(function (doc) {
                $(this).collapse('hide');
            });
        }
    });

    /**
     * Used to hide categories in the category navigation bar
     *
     * @param index current category index in array
     * @param addition if additional css needed
     * @returns {*} final css class
     */
    $scope.getCategoryClass = function(index, addition) {
        // todo parametrise constant by checking out device display size
        if ($scope.collapsed && index >= MAX_VISIBLE_CATEGORIES)
            return 'hidden';
        if (typeof addition !== 'undefined')
            return 'nav ' + addition;
        return 'nav';
    };

    /**
     * Used to toggle category navigation item icon on click
     *
     * @returns {*} toggled css icon
     */
    $scope.getToggleClass = function() {
        if ($scope.collapsed)
            return 'fa fa-fw fa-chevron-down';
        return 'fa fa-fw fa-chevron-up';
    };

    /**
     * Used to toggle category navigation
     */
    $scope.toggleShowCategories = function () {
        $scope.collapsed = !$scope.collapsed;
    };

    /**
     * Used to toggle user category configuration
     */
    $scope.toggleConfigurable = function () {
        //TODO add functionality
        console.log('HAHA');
    };

    /**
     * Call retrieve all categories web service on load
     */
    CategoryService.retrieveCategories()
        .then(function (json) {
            // promise fulfilled
            $scope.categories = json;
        }, function(error) {
            // display error message in UI
        });
});