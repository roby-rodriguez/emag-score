/**
 * Created by robaa on 11.08.2015.
 */
angular.module('emagScoreApp').controller('HomeController', function($scope, HomeFactory, ProductFactory) {
    $scope.tabs = [
        { color : 'primary', icon : 'fa-smile-o', title : 'Trending Low', link : 'trendingLow' },
        { color : 'green', icon : 'fa-frown-o', title : 'Trending High', link : 'trendingHigh' },
        { color : 'yellow', icon : 'fa-plus-circle', title : 'New Products' },
        { color : 'red', icon : 'fa-ban', title : 'Retired products' },
    ];
    
    $scope.setTabNavigation = function (selectedTab) {
        HomeFactory.setTab(selectedTab);
        ProductFactory.toggleProductTrending(selectedTab.link);
        ProductFactory.refreshProducts();
    }
});
