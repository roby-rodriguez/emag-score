/**
 * Created by robaa on 01.07.2015.
 */
var app = angular.module("emagScoresApp", ['ngRoute']);

app.config(function($routeProvider) {
    $routeProvider
        .when('/home', {
            templateUrl: 'views/home.html',
            controller: 'HomeController'
        })
        .when('/favorites', {
            templateUrl: 'views/favorites.html',
            controller: 'FavoritesController'
        })
        .otherwise({
            redirectTo: '/home'
        });
});