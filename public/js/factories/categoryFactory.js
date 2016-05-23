/**
 * Factory for creating the 'category' object that is used for category.html
 */
angular.module('emagScoreApp').factory('CategoryFactory', function(CategoryService, ProductFactory) {
    var subcategory = {};
    var selectedCategories;
    var excludedCategories = [];
    
    function initCategories() {
        CategoryService.retrieveCategories()
            .then(function (json) {
                // promise fulfilled
                selectedCategories = json;
            }, function(error) {
                // display error message in UI
            });
    }
    
    function position(array, category) {
    	for (var i = 0; i < array.length; i++)
    	    if (array[i].title == category.title)
    	        return i;
    	return -1;
    }
    
    function remove(category, subcategory) {
		for (var j = 0; j < category.subcategories.length; j++)
			if (category.subcategories[j].title == subcategory.title) {
				category.subcategories.splice(j, 1);
				return;
			}
    }
    
    function select(selectedCategory, selectedSubcategory, selection) {
        var src, dest, categoryPos, subcategoryPos;
        if (selection) {
            src = excludedCategories;
            dest = selectedCategories;
        } else {
            src = selectedCategories;
            dest = excludedCategories;
        }
        if ((categoryPos = position(src, selectedCategory)) > -1) {
        	if (selectedSubcategory) {
        		if ((subcategoryPos = position(dest, selectedCategory)) > -1)
        			dest[subcategoryPos].subcategories.push(selectedSubcategory);
        		else {
        			dest.push({_id: selectedCategory._id, title: selectedCategory.title, subcategories: []});
        			dest[dest.length - 1].subcategories.push(selectedSubcategory);
        		}
        		remove(src[categoryPos], selectedSubcategory);
        	} else {
        		if ((subcategoryPos = position(dest, selectedCategory)) > -1)
        			dest[subcategoryPos].subcategories = dest[subcategoryPos].subcategories.concat(src[categoryPos].subcategories);
        		else
        			dest.push(src[categoryPos]);
        		src.splice(categoryPos, 1);
        	}
        } else {
        	if (selectedSubcategory) {
        		dest.push({_id: selectedCategory._id, title: selectedCategory.title, subcategories: []});
        		dest[dest.length - 1].subcategories.push(selectedSubcategory);
        		remove(src[categoryPos], selectedSubcategory);
        	} else {
        		dest.push(selectedCategory);
        		src.splice(categoryPos, 1);
        	}
        }
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
            if (!selectedCategories) {
                selectedCategories = [];
                initCategories();
            }
            return selectedCategories;
        },
        getAvailableCategories: function() {
            return excludedCategories;
        },
        removeSelection: function(selectedCategory, selectedSubcategory) {
            select(selectedCategory, selectedSubcategory, false);
        },
        addSelection: function(selectedCategory, selectedSubcategory) {
        	select(selectedCategory, selectedSubcategory, true);
        },
        initCategory: function(callback) {
            callback(subcategory);
        }
    };
});