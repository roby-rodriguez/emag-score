angular.module('emagScoreApp').factory('ProductSearchProvider', function(Environment) {

    function ProductSearchProvider(paginator, searchKeyword) {
        this.currentPage = paginator.currentPage;
        this.resultsPerPage = paginator.resultsPerPage;
        this.data = searchKeyword;
    }
    ProductSearchProvider.prototype.getProductsURL = function () {
        return Environment.searchProductsUrl + this.currentPage + '/' + this.resultsPerPage + '/' + this.data;
    };
    ProductSearchProvider.prototype.getTotalsURL = function () {
        return Environment.countProductsUrl + 'title' +'/' + this.data;
    };
    
    return ProductSearchProvider;
});