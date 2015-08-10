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
            $(this)
                .parent()
                .find(".fa-plus-circle")
                .removeClass(".fa-plus-circle")
                .addClass(".fa-minus-circle");
        })
        .on('hidden.bs.collapse', function () {
            $(this)
                .parent()
                .find(".fa-minus-circle")
                .removeClass(".fa-minus-circle")
                .addClass(".fa-plus-circle");
        });
});