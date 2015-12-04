/**
 * Created by johndoe on 15.11.2015.
 */
angular.module('emagScoreApp')
    .controller('TopMenuController', function($scope, $location, ProductSearchFactory) {
        $scope.keyword = '';
        $scope.searchInputEnter = function (keyEvent) {
            if (keyEvent.which === 13) {
                ProductSearchFactory.setSearchKeyword($scope.keyword);
                return $location.url('/productSearch');
            }
        };
    });