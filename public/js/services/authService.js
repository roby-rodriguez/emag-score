/**
 * Created by johndoe on 20.09.2015.
 */
angular.module('emagScoreApp').service('AuthService', function($http, AuthFactory) {
    var baseUrl = 'https://emag-score-roby-rodriguez.c9.io/';

    // this used to use deferred
    this.login = function (user, next) {
        // do we really need return here?
        return $http.post('/login', user).success(function(token){
            AuthFactory.setToken(token);
            next();
        });
    };

    this.logout = function () {
        AuthFactory.clearToken();
    };

    this.register = function (user, next) {
        return $http.post('/register', user).success(function(token){
            AuthFactory.setToken(token);
            next();
        });
    };

    this.isAuthenticated = AuthFactory.isAuthenticated;
});