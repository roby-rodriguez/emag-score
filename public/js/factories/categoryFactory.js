/**
 * Factory for creating the 'category' object that is used for category.html
 */
angular.module('emagScoreApp').factory('CategoryFactory', function(CategoryService, ProductFactory) {
    var subcategory = {};
    var categories;
    
    function initCategories() {
        CategoryService.retrieveCategories()
            .then(function (json) {
                // promise fulfilled
                categories = json;
            }, function(error) {
                // display error message in UI
            });
    }

    return {
        setCategory: function(data) {
            if (data && data.name !== subcategory.name) {
                subcategory = data;
                ProductFactory.toggleProductCategory(subcategory.name);
                ProductFactory.refreshProducts();
            }
        },
        getCategory: function() {
            return subcategory;
        },
        getCategories: function() {
            if (!categories) {
                categories = [];
                initCategories();
            }
            return categories;
        },
        initCategory: function(callback) {
            callback(subcategory);
        }
    };
});