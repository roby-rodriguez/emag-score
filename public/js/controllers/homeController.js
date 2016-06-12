angular.module('emagScoreApp').controller('HomeController', function($scope, ProductService, HomeFactory, ProductFactory,
                                                                     ProductTrendProvider) {
    // ugly af -> needs refactoring
    $scope.tabs = [
        { color : 'primary', icon : 'fa-smile-o', title : 'Trending Low', link : 'low' },
        { color : 'green', icon : 'fa-frown-o', title : 'Trending High', link : 'high' },
        { color : 'yellow', icon : 'fa-plus-circle', title : 'New Products' },
        { color : 'red', icon : 'fa-ban', title : 'Retired products' }
    ];
    
    $scope.setTabNavigation = function (selectedTab) {
        HomeFactory.setTab(selectedTab);
        ProductFactory.toggleProductTrending(selectedTab.link);
        ProductFactory.refreshProducts();
    };

    ProductService.retrieveTotalNrOfProducts(new ProductTrendProvider('low'))
        .then(function (total) {
            // promise fulfilled
            $scope.tabs[0].count = total;
        }, function(error) {
            // display error message in UI
        });

    ProductService.retrieveTotalNrOfProducts(new ProductTrendProvider('high'))
        .then(function (total) {
            // promise fulfilled
            $scope.tabs[1].count = total;
        }, function(error) {
            // display error message in UI
        });
});