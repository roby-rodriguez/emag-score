/**
 * Created by johndoe on 15.11.2015.
 */
angular.module('emagScoreApp').factory('HomeFactory', function() {
    var tab = {};

    return {
        setTab: function(data) {
            tab = data;
        },
        getTab: function() {
            return tab;
        }
    };
});