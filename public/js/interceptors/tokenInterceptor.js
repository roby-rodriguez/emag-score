/**
 * Created by johndoe on 07.11.2015.
 */
angular.module('emagScoreApp').factory('TokenInjector', function (AuthFactory) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if (AuthFactory.isAuthenticated())
                config.headers['Authorization'] = 'Bearer ' + AuthFactory.getToken();
            return config || $q.when(config);
        }
    };
});