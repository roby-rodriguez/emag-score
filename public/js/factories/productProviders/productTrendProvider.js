angular.module('emagScoreApp').factory('ProductTrendProvider', function(Environment) {

    function ProductTrendProvider(trendingType) {
        this.type = trendingType;
        this.paginator = {
            maxPages: 5,
            currentPage: 1,
            resultsPerPage: 5
        };
    }
    ProductTrendProvider.prototype.getProductsURL = function () {
        return Environment.productsUrl + '/' + this.type + '/' +this.paginator.currentPage + '/' + this.paginator.resultsPerPage;
    };
    ProductTrendProvider.prototype.getTotalsURL = function () {
        return Environment.countProductsUrl + this.type;
    };
    
    return ProductTrendProvider;
});