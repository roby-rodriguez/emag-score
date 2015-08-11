/**
 * Created by robaa on 01.07.2015.
 */
/**
 * Top links:
 * http://weblogs.asp.net/dwahlin/learning-angularjs-by-example-the-customer-manager-application
 * https://github.com/DanWahlin/CustomerManagerStandard/
 * Links:
 * http://www.journaldev.com/6225/angular-js-routing-and-multiple-views-tutorial-example
 */
var app = angular.module("emagScoresApp", [
    'ngRoute',
    'ui.bootstrap'
]);
app.constant('ENDPOINT_URI', 'http://localhost:1337/');
app.config(function ($routeProvider) {
    $routeProvider
        .when('/home', {
            templateUrl: 'views/home.html',
            controller: 'HomeController',
            controllerAs: 'vm'
        })
        .when('/product', {
            templateUrl: 'views/product.html',
            controller: 'ProductController',
            controllerAs: 'vm'
        })
        .when('/productDetail', {
            templateUrl: 'views/productDetail.html',
            controller: 'ProductDetailController',
            controllerAs: 'vm'
        })
        .when('/favorites', {
            templateUrl: 'views/favorites.html',
            controller: 'FavoritesController',
            controllerAs: 'vm'
        })
        .otherwise({
            redirectTo: '/home'
        });
});
