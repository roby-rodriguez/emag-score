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
    //var category = '';
    var productsUrl = 'http://localhost:1337/products';

    this.retrieveProducts = function (category, pageNr, resultsPerPage) {
        var deferred = $q.defer();
        $http({
            url: productsUrl + '/' + pageNr + '/' + resultsPerPage + '/' + category
        }).success(function(json){
            deferred.resolve(json);
        }).error(function () {
            deferred.reject('An error has occured.');
        });
        return deferred.promise;
    }
    //todo make this by category
    this.retrieveTotalNrOfProducts = function (category) {
        var deferred = $q.defer();
        $http({
            url: productsUrl + '/total' + category
        }).success(function(json){
            deferred.resolve(json);
        }).error(function () {
            deferred.reject('An error has occured.');
        });
        return deferred.promise;
    }
});