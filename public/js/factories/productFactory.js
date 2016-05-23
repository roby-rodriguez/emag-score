/**
 * Factory for creating the 'product' object that is used for product.html
 *
 * Links:
 * http://stackoverflow.com/questions/22408790/angularjs-passing-data-between-pages
 * http://stackoverflow.com/questions/12574765/better-design-for-passing-data-to-other-ng-views-and-persisting-it-across-contr
 */
angular.module('emagScoreApp').factory('ProductFactory', function(ProductService, Environment) {
    var product = {};
    var products = [];
    var productProvider;
    var paginator = {
        maxPages: 5,
        currentPage: 1,
        resultsPerPage: 5
    };

    function ProductCategoryProvider(category) {
        this.data = category;
    }
    ProductCategoryProvider.prototype.getProductsURL = function () {
        return Environment.retrieveProductsUrl + paginator.currentPage + '/' + paginator.resultsPerPage + '/' + this.data;
    };
    ProductCategoryProvider.prototype.getTotalsURL = function () {
        return Environment.countProductsUrl + 'category' +'/' + this.data;
    };

    function ProductSearchProvider(searchKeyword) {
        this.data = searchKeyword;
    }
    ProductSearchProvider.prototype.getProductsURL = function () {
        return Environment.searchProductsUrl + paginator.currentPage + '/' + paginator.resultsPerPage + '/' + this.data;
    };
    ProductSearchProvider.prototype.getTotalsURL = function () {
        return Environment.countProductsUrl + 'title' +'/' + this.data;
    };

    function ProductTrendProvider(trendingType, category) {
        this.type = trendingType;
        this.data = category;
    }
    ProductTrendProvider.prototype.getProductsURL = function () {
        return Environment.productsUrl + '/' + this.type + '/' +paginator.currentPage + '/' + paginator.resultsPerPage + '/' + this.data;
    };
    ProductTrendProvider.prototype.getTotalsURL = function () {
        return Environment.countProductsUrl + this.type +'/' + this.data;
    };
    
    function ProductFavoriteProvider(userId) {
        this.data = userId;
    }
    ProductFavoriteProvider.prototype.getProductsURL = function () {
        return Environment.retrieveFavoritesUrl + paginator.currentPage + '/' + paginator.resultsPerPage + '/' + this.data;
    };
    ProductFavoriteProvider.prototype.getTotalsURL = function () {
        return Environment.countFavoritesUrl + this.data;
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
            productProvider = new ProductCategoryProvider(data);
        },
        toggleProductSearch: function (data) {
            paginator.currentPage = 1;
            productProvider = new ProductSearchProvider(data);
        },
        toggleProductTrending: function (type, data) {
            paginator.currentPage = 1;
            productProvider = new ProductTrendProvider(type, data);
        },
        toggleProductFavorite: function (data) {
            paginator.currentPage = 1;
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
                    paginator.total = total;
                }, function(error) {
                    // display error message in UI
                });
        }
    };
});