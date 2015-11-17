/**
 * Factory for creating the 'category' object that is used for category.html
 */
angular.module('emagScoreApp').factory('CategoryFactory', function(ProductFactory) {
    var subcategory = {};

    return {
        setCategory: function(data) {
            if (data && data.name !== subcategory.name) {
                subcategory = data;
                ProductFactory.setDirty(true);
            }
        },
        getCategory: function(callback) {
            return subcategory;
        },
        initCategory: function(callback) {
            callback(subcategory);
        }
    };
});