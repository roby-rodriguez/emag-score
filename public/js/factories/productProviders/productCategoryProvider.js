angular.module('emagScoreApp').factory('ProductCategoryProvider', function(Environment) {

    function ProductCategoryProvider(category) {
        this.data = category;
        this.paginator = {
            maxPages: 5,
            currentPage: 1,
            resultsPerPage: 5
        };
    }
    ProductCategoryProvider.prototype.getProductsURL = function () {
        return Environment.retrieveProductsUrl + this.paginator.currentPage + '/' + this.paginator.resultsPerPage + '/' + this.data;
    };
    ProductCategoryProvider.prototype.getTotalsURL = function () {
        return Environment.countProductsUrl + 'category' +'/' + this.data;
    };

    return ProductCategoryProvider;
});