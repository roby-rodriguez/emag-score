/**
 * Created by johndoe on 15.11.2015.
 */
angular.module('emagScoreApp').factory('ProductSearchFactory', function(ProductFactory) {
    var search = { keyword : '' };

    return {
        setSearchKeyword: function(data) {
            if (!data) {
                ProductFactory.setProducts([]);
            } else if (data !== search.keyword) {
                ProductFactory.toggleProductSearch(data);
                ProductFactory.refreshProducts();
            }
            search.keyword = data;
        },
        getSearchKeyword: function() {
            return search.keyword;
        }
    };
});