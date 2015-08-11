/**
 * Factory for creating the 'category' object that is used for category.html
 */
angular.module('emagScoresApp').factory('CategoryFactory', function() {
    var subcategory = {};

    return {
        setCategory: function(data) {
            subcategory = data;
        },
        getCategory: function(callback) {
            callback(subcategory);
        }
    };
});