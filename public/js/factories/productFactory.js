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
        getPaginator: function() {
            return productProvider.paginator;
        },
        toggleProductCategory: function (data) {
            productProvider = new ProductCategoryProvider(data);
        },
        toggleProductSearch: function (data) {
            productProvider = new ProductSearchProvider(data);
        },
        toggleProductTrending: function (type, data) {
            productProvider = new ProductTrendProvider(type, data);
        },
        toggleProductFavorite: function (data) {
            productProvider = new ProductFavoriteProvider(data);
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
                    productProvider.paginator.total = total;
                }, function(error) {
                    // display error message in UI
                });
        }
    };
});