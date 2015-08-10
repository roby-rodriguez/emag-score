/**
 * Created by robaa on 02.07.2015.
 */
/**
 * Some links for collapse:
 * http://stackoverflow.com/questions/18147338/twitter-bootstrap-3-0-icon-change-on-collapse
 * http://getbootstrap.com/javascript/#collapse
 * http://www.bootply.com/73101
 */
$(document).ready(function () {
    $('.collapse')
        .on('shown.bs.collapse', function () {
            var obj = this;
        })
        .on('hidden.bs.collapse', function () {
            var obj = this;
        });
});