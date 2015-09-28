/**
 * Factory for creating the 'category' object that is used for category.html
 */
angular.module('emagScoreApp').factory('CategoryFactory', function() {
    var subcategory = {};

    return {
        setCategory: function(data) {
            subcategory = data;
        },
        getCategory: function(callback) {
            return subcategory;
        },
        initCategory: function(callback) {
            callback(subcategory);
        },
    };
});