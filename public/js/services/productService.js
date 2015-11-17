/**
 * Created by johndoe on 15.07.2015.
 */
/**
 * Service for calling the products REST API
 *
 * Links:
 * http://tylermcginnis.com/angularjs-factory-vs-service-vs-provider/
 */
angular.module('emagScoreApp').service('ProductService', function($http, $q, AuthFactory, Environment) {
    this.retrieveProducts = function (category, pageNr, resultsPerPage) {
        var deferred = $q.defer();
        $http({
            url: Environment.retrieveProductsUrl + pageNr + '/' + resultsPerPage + '/' + category
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
            url: Environment.searchProductsUrl + pageNr + '/' + resultsPerPage + '/' + keyword
        }).success(function(json){
            deferred.resolve(json);
        }).error(function () {
            deferred.reject('An error has occured.');
        });
        return deferred.promise;
    };

    this.retrieveTrendingProducts = function (type, category, pageNr, resultsPerPage) {
        var deferred = $q.defer();
        $http({
            url: Environment.productsUrl + '/' + type + '/' +pageNr + '/' + resultsPerPage + '/' + category
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
            url: Environment.countProductsUrl + obj.type + '/' + obj.keyword
        }).success(function(json){
            deferred.resolve(json);
        }).error(function () {
            deferred.reject('An error has occured.');
        });
        return deferred.promise;
    };

    this.addFavorite = function (productId, next) {
        return $http.post(Environment.addFavoriteUrl,
            {
                email: AuthFactory.currentUser(),
                pid: productId
            }).success(function(info){
                next(info);
            });
    };
});