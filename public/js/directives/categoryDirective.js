/**
 * Directives for category view
 *
 * 1) The *.bs.collapse callbacks cannot be placed in $(document).ready
 * because ready is called prior to angular.
 */
angular.module('emagScoresApp')
    /**
     * Some links for collapse:
     * http://stackoverflow.com/questions/18147338/twitter-bootstrap-3-0-icon-change-on-collapse
     * http://getbootstrap.com/javascript/#collapse
     * http://www.bootply.com/73101
     */
    .directive('collapsible', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                $(element).on('show.bs.collapse', function () {
                    $(this)
                        .parent()
                        .find(".fa-plus-circle")
                        .removeClass("fa-plus-circle")
                        .addClass("fa-minus-circle");
                })
                    .on('hide.bs.collapse', function () {
                        $(this)
                            .parent()
                            .find(".fa-minus-circle")
                            .removeClass("fa-minus-circle")
                            .addClass("fa-plus-circle");
                    });
            }
        };
    });
;