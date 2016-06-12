angular.module('emagScoreApp').factory('ProductTrendProvider', function(Environment) {

    function ProductTrendProvider(trendingType, category) {
        this.type = trendingType;
        this.data = category;
        if (category) {
            this.paginator = {
                maxPages: 5,
                currentPage: 1,
                resultsPerPage: 5
            };
        }
    }
    ProductTrendProvider.prototype.getProductsURL = function () {
        return Environment.productsUrl + '/' + this.type + '/' +this.paginator.currentPage + '/' + this.paginator.resultsPerPage + '/' + this.data;
    };
    ProductTrendProvider.prototype.getTotalsURL = function () {
        return Environment.countProductsUrl + this.type +'/' + this.data;
    };
    
    return ProductTrendProvider;
});