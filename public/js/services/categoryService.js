/**
 * Created by johndoe on 10.08.2015.
 */
/**
 * Service for calling the categories REST API
 */
angular.module('emagScoreApp').service('CategoryService', function($http, $q, Environment) {
    this.retrieveCategories = function () {
        var deferred = $q.defer();
        $http({
            url: Environment.categoriesUrl
        }).success(function(json){
            deferred.resolve(json);
        }).error(function () {
            deferred.reject('An error has occured.');
        });
        return deferred.promise;
    }
});