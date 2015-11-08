/**
 * TODO use grunt to generate this directly - you need to extend the grunt-ng-constant npm module
 * see http://stackoverflow.com/a/26549264/5173530
 */
angular.module('emagScoreConstant', []).constant('Environment', (function (API_ENDPOINT) {
    //var API_ENDPOINT = %% etc
    return {
        apiEndpoint: API_ENDPOINT,
        categoriesUrl: API_ENDPOINT + '/categories',
        productsUrl: API_ENDPOINT + '/products',
        retrieveProductsUrl: API_ENDPOINT + '/products/retrieve/',
        searchProductsUrl: API_ENDPOINT + '/products/search/',
        countProductsUrl: API_ENDPOINT + '/products/total/',
        addFavoriteUrl: API_ENDPOINT + '/secured/favorites/add'
    }
})());