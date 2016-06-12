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
angular.module("emagScoreApp", [
    'ngRoute',
    'ngAnimate',
    'ui.bootstrap',
    'ngDragDrop',
    'emagScoreConstant'
]).run(function ($rootScope, Environment) {
    $rootScope.Environment = Environment;
}).config(function ($routeProvider, $httpProvider) {
    $httpProvider.interceptors.push('TokenInjector');
    $httpProvider.interceptors.push('RequestLoadingInterceptor');
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
        .when('/productSearch', {
            templateUrl: 'views/product.html',
            controller: 'ProductSearchController',
            controllerAs: 'vm'
        })
        .when('/productDetail', {
            templateUrl: 'views/productDetail.html',
            controller: 'ProductDetailController',
            controllerAs: 'vm'
        })
        .when('/low', {
            templateUrl: 'views/product.html',
            controller: 'ProductTrendController',
            controllerAs: 'vm'
        })
        .when('/high', {
            templateUrl: 'views/product.html',
            controller: 'ProductTrendController',
            controllerAs: 'vm'
        })
        .when('/favorites', {
            templateUrl: 'views/favorites.html',
            controller: 'FavoritesController',
            controllerAs: 'vm'
        })
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'AuthController'
        })
        .when('/signin', {
            templateUrl: 'views/signin.html',
            controller: 'AuthController'
        })
        .when('/signup', {
            templateUrl: 'views/signup.html',
            controller: 'AuthController'
        })
        .otherwise({
            redirectTo: '/home'
        });
});