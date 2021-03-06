/**
 * Created by johndoe on 15.07.2015.
 */
/**
 * Service for calling the products REST API
 *
 * Links:
 * http://tylermcginnis.com/angularjs-factory-vs-service-vs-provider/
 */
angular.module('emagScoresApp').service('ProductService', function($http, $q) {
    var productsUrl = 'http://localhost:1337/products';

    this.retrieveProducts = function (category, pageNr, resultsPerPage) {
        var deferred = $q.defer();
        $http({
            url: productsUrl + '/retrieve/' + pageNr + '/' + resultsPerPage + '/' + category
        }).success(function(json){
            deferred.resolve(json);
        }).error(function () {
            deferred.reject('An error has occured.');
        });
        return deferred.promise;
    };

    this.searchProducts = function (keyword, pageNr, resultsPerPage) {
        var deferred = $q.defer();
        $http({
            url: productsUrl + '/search/' + pageNr + '/' + resultsPerPage + '/' + keyword
        }).success(function(json){
            deferred.resolve(json);
        }).error(function () {
            deferred.reject('An error has occured.');
        });
        return deferred.promise;
    };

    this.retrieveTotalNrOfProducts = function (obj) {
        var deferred = $q.defer();
        $http({
            url: productsUrl + '/total/' + obj.type + '/' + obj.keyword
        }).success(function(json){
            deferred.resolve(json);
        }).error(function () {
            deferred.reject('An error has occured.');
        });
        return deferred.promise;
    };
});