/**
 * Created by johndoe on 21.09.2015.
 */
angular.module('emagScoreApp').factory('AuthFactory', function ($window) {
    var auth = {};

    auth.setToken = function (tokenJson) {
        $window.localStorage['emag-score-token'] = tokenJson.token;
    };

    auth.getToken = function () {
        return $window.localStorage['emag-score-token'];
    };

    auth.clearToken = function () {
        $window.localStorage.removeItem('emag-score-token');
    };

    /**
     * Checks if token exists in window local storage. If it exists,
     * the exp date is checked
     *
     * @returns {boolean} true if valid token
     */
    auth.isAuthenticated = function () {
        var token = auth.getToken();

        // decode the core of the token (base64'd) and check exp
        if (token) {
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        }
        return false;
    };

    /**
     * Extracts the current user email from the token
     *
     * @returns {string} current user email
     */
    auth.currentUser = function () {
        if (auth.isAuthenticated()) {
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return payload.email;
        }
    };

    return auth;
});