/**
 * Created by johndoe on 10.08.2015.
 */
/**
 * Service for calling the categories REST API
 */
angular.module('emagScoreApp').service('CategoryService', function($http, $q) {
    var categoriesUrl = 'http://localhost:1337/categories';

    this.retrieveCategories = function () {
        var deferred = $q.defer();
        $http({
            url: categoriesUrl
        }).success(function(json){
            deferred.resolve(json);
        }).error(function () {
            deferred.reject('An error has occured.');
        });
        return deferred.promise;
    }
});