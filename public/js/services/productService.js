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

    this.retrieveProducts = function () {
        var deferred = $q.defer();
        $http({
            method: 'JSONP',
            url: productsUrl
        }).success(function(json){
            deferred.resolve(json);
        }).error(function () {
            deferred.reject('An error has occured.');
        });
        return deferred.promise;
    }
});