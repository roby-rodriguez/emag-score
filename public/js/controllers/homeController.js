/**
 * Created by robaa on 11.08.2015.
 */
angular.module('emagScoresApp').controller('HomeController', function($scope) {
    $scope.tabs = [
        { color : 'primary', icon : 'fa-smile-o', title : 'Trending Low' },
        { color : 'green', icon : 'fa-frown-o', title : 'Trending High' },
        { color : 'yellow', icon : 'fa-plus-circle', title : 'New Products' },
        { color : 'red', icon : 'fa-ban', title : 'Retired products' },
    ];
});
