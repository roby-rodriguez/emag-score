angular.module('emagScoreApp').factory('ProductTrendProvider', function(Environment) {

    function ProductTrendProvider(paginator, trendingType, category) {
        if (paginator) {
            this.currentPage = paginator.currentPage;
            this.resultsPerPage = paginator.resultsPerPage;
        }
        this.type = trendingType;
        this.data = category;
    }
    ProductTrendProvider.prototype.getProductsURL = function () {
        return Environment.productsUrl + '/' + this.type + '/' +this.currentPage + '/' + this.resultsPerPage + '/' + this.data;
    };
    ProductTrendProvider.prototype.getTotalsURL = function () {
        return Environment.countProductsUrl + this.type +'/' + this.data;
    };
    
    return ProductTrendProvider;
});