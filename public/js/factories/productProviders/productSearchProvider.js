angular.module('emagScoreApp').factory('ProductSearchProvider', function(Environment) {

    function ProductSearchProvider(searchKeyword) {
        this.data = searchKeyword;
        this.paginator = {
            maxPages: 5,
            currentPage: 1,
            resultsPerPage: 5
        };
    }
    ProductSearchProvider.prototype.getProductsURL = function () {
        return Environment.searchProductsUrl + this.paginator.currentPage + '/' + this.paginator.resultsPerPage + '/' + this.data;
    };
    ProductSearchProvider.prototype.getTotalsURL = function () {
        return Environment.countProductsUrl + 'title' +'/' + this.data;
    };
    
    return ProductSearchProvider;
});