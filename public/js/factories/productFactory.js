/**
 * Factory for creating the 'product' object that is used for product.html
 *
 * Links:
 * http://stackoverflow.com/questions/22408790/angularjs-passing-data-between-pages
 * http://stackoverflow.com/questions/12574765/better-design-for-passing-data-to-other-ng-views-and-persisting-it-across-contr
 */
angular.module('emagScoreApp').factory('ProductFactory', function(ProductService, ProductCategoryProvider,
                                                                  ProductSearchProvider, ProductTrendProvider,
                                                                  ProductFavoriteProvider) {
    var product = {};
    var products = [];
    var productProvider;
    var paginator = {
        maxPages: 5,
        currentPage: 1,
        resultsPerPage: 5
    };

    return {
        setProduct: function(data) {
            product = data;
        },
        getProduct: function() {
            return product;
        },
        setProducts: function(data) {
            products = data;
        },
        getProducts: function() {
            return products;
        },
        setTotalPages: function (total) {
            paginator.total = total;
        },
        setCurrentPage: function (currentPage) {
            paginator.currentPage = currentPage;
        },
        getPaginator: function() {
            return paginator;
        },
        toggleProductCategory: function (data) {
            paginator.currentPage = 1;
            productProvider = new ProductCategoryProvider(paginator, data);
        },
        toggleProductSearch: function (data) {
            paginator.currentPage = 1;
            productProvider = new ProductSearchProvider(paginator, data);
        },
        toggleProductTrending: function (type, data) {
            paginator.currentPage = 1;
            productProvider = new ProductTrendProvider(paginator, type, data);
        },
        toggleProductFavorite: function (data) {
            paginator.currentPage = 1;
            productProvider = new ProductFavoriteProvider(paginator, data);
        },
        refreshProducts: function () {
            ProductService.retrieveProducts(productProvider)
                .then(function (json) {
                    // promise fulfilled
                    products = json;
                }, function(error) {
                    // display error message in UI - maybe you need to add an error property in this factory that gets displayed somewhere in the page
                });
            ProductService.retrieveTotalNrOfProducts(productProvider)
                .then(function (total) {
                    // promise fulfilled
                    paginator.total = total;
                }, function(error) {
                    // display error message in UI
                });
        }
    };
});