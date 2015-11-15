/**
 * Created by johndoe on 15.11.2015.
 */
angular.module('emagScoreApp').factory('ProductSearchFactory', function() {
    var search = { keyword : '' };

    return {
        setSearchKeyword: function(data) {
            search.keyword = data;
        },
        getSearchKeyword: function() {
            return search.keyword;
        }
    };
});