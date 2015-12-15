/**
 * Factory for creating the 'category' object that is used for category.html
 */
angular.module('emagScoreApp').factory('CategoryFactory', function(CategoryService, ProductFactory) {
    var subcategory = {};
    var categories;
    var selectedCategories = [];
    
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
        getSelectedCategories: function() {
            return selectedCategories;
        },
        addSelection: function(selectedCategory, selectedSubcategory) {
        	for (var i = 0; i < categories.length; i++)
        		if (categories[i].title == selectedCategory.title) {
        			if (selectedSubcategory) {
        				var foundPosition = -1;
        				for (var k = 0; k < selectedCategories.length; k++)
        					if (selectedCategories[k].title == selectedCategory.title) {
        						foundPosition = k;
        						break;
        					}
        				if (foundPosition > -1)
        					selectedCategories[foundPosition].subcategories.push(selectedSubcategory);
        				else {
        					selectedCategories.push({_id: selectedCategory._id, title: selectedCategory.title, subcategories: []});
        					selectedCategories[selectedCategories.length - 1].subcategories.push(selectedSubcategory);
        				}
        				for (var j = 0; j < categories[i].subcategories.length; j++)
        					if (categories[i].subcategories[j].title == selectedSubcategory.title) {
        						categories[i].subcategories.splice(j, 1);
        						return;
        					}
        			} else {
        			    foundPosition = -1;
        			    for (var j = 0; j < selectedCategories.length; j++)
        			        if (selectedCategories[j].title == selectedCategory.title) {
        			            foundPosition = j;
        			            break;
        			        }
        			    if (foundPosition > -1)
        			        selectedCategories[foundPosition].subcategories = selectedCategories[foundPosition].subcategories.concat(categories[i].subcategories);
        				else
        				    selectedCategories.push(categories[i]);
        				categories.splice(i, 1);
        				break;
        			}
        		}
        },
        initCategory: function(callback) {
            callback(subcategory);
        }
    };
});