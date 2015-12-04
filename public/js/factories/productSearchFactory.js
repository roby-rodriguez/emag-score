/**
 * Created by johndoe on 15.11.2015.
 */
angular.module('emagScoreApp').factory('ProductSearchFactory', function(ProductFactory) {
    var search = { keyword : '' };

    return {
        setSearchKeyword: function(data) {
            ProductFactory.setDirty(true);
            if (!data) {
                ProductFactory.setProducts([]);
                ProductFactory.setDirty(false);
            } else if (data === search.keyword) {
                ProductFactory.setDirty(false);
            }
            search.keyword = data;
        },
        getSearchKeyword: function() {
            return search.keyword;
        }
    };
});