angular.module('emagScoreApp').factory('ProductFavoriteProvider', function(Environment) {

    function ProductFavoriteProvider(paginator, userId) {
        this.currentPage = paginator.currentPage;
        this.resultsPerPage = paginator.resultsPerPage;
        this.data = userId;
    }
    ProductFavoriteProvider.prototype.getProductsURL = function () {
        return Environment.retrieveFavoritesUrl + this.currentPage + '/' + this.resultsPerPage + '/' + this.data;
    };
    ProductFavoriteProvider.prototype.getTotalsURL = function () {
        return Environment.countFavoritesUrl + this.data;
    };

    return ProductFavoriteProvider;
});