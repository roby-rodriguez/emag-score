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
    this.retrieveProducts = function (productProvider) {
        var deferred = $q.defer();
        $http({
            url: productProvider.getProductsURL()
        }).success(function(json){
            deferred.resolve(json);
        }).error(function (err) {
            deferred.reject('An error has occured: ' + err);
        });
        return deferred.promise;
    };

    this.retrieveTotalNrOfProducts = function (productProvider) {
        var deferred = $q.defer();
        $http({
            url: productProvider.getTotalsURL()
        }).success(function(json){
            deferred.resolve(json);
        }).error(function (err) {
            deferred.reject('An error has occured: ' + err);
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