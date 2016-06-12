angular.module('emagScoreApp').factory('ProductFavoriteProvider', function(Environment) {

    function ProductFavoriteProvider(userId) {
        this.data = userId;
        this.paginator = {
            maxPages: 5,
            currentPage: 1,
            resultsPerPage: 5
        };
    }
    ProductFavoriteProvider.prototype.getProductsURL = function () {
        return Environment.retrieveFavoritesUrl + this.paginator.currentPage + '/' + this.paginator.resultsPerPage + '/' + this.data;
    };
    ProductFavoriteProvider.prototype.getTotalsURL = function () {
        return Environment.countFavoritesUrl + this.data;
    };

    return ProductFavoriteProvider;
});