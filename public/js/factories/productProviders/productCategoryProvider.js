angular.module('emagScoreApp').factory('ProductCategoryProvider', function(Environment) {

    function ProductCategoryProvider(paginator, category) {
        this.currentPage = paginator.currentPage;
        this.resultsPerPage = paginator.resultsPerPage;
        this.data = category;
    }
    ProductCategoryProvider.prototype.getProductsURL = function () {
        return Environment.retrieveProductsUrl + this.currentPage + '/' + this.resultsPerPage + '/' + this.data;
    };
    ProductCategoryProvider.prototype.getTotalsURL = function () {
        return Environment.countProductsUrl + 'category' +'/' + this.data;
    };

    return ProductCategoryProvider;
});