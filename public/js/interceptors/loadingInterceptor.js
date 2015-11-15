/**
 * Created by johndoe on 07.11.2015.
 */
angular.module('emagScoreApp').factory('RequestLoadingInterceptor', function ($q, $rootScope, Environment) {
    var pendingRequests = [];

    //see http://codingsmackdown.tv/blog/2013/01/02/using-response-interceptors-to-show-and-hide-a-loading-widget/
    function mapLoadedComponent(url) {
        if (url.indexOf(Environment.productsUrl) != -1)
            return '#productLoadingWidget';
        else if (url.indexOf(Environment.categoriesUrl) != -1)
            return '#categoryLoadingWidget';
    }

    function handleResponse(response) {
        var component = mapLoadedComponent(response.config.url);
        if (component && pendingRequests.indexOf(component) > -1) {
            var index = pendingRequests.indexOf(component);
            pendingRequests.splice(index, 1);
            $(component).hide();
        }
    }

    return {
        request: function (config) {
            var component = mapLoadedComponent(config.url);
            if (component && pendingRequests.indexOf(component) == -1) {
                pendingRequests.push(component);
                // do the time-out based ajax-loader
                setTimeout(function () {
                    // todo check if showing still necessary, ie. if response has already been received or not
                    $(component).show();
                }, 500);
            }
            return config || $q.when(config);
        },
        response: function (response) {
            handleResponse(response);
            return response || $q.when(response);
        },
        responseError: function (response) {
            handleResponse(response);
            return $q.reject(response);
        }
    };
});