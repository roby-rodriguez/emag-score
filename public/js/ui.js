/**
 * Created by robaa on 02.07.2015.
 *
 * About event bubbling and how to get rid of it:
 * http://stackoverflow.com/questions/12077859/difference-between-this-and-event-target
 * Some links for collapse:
 * http://stackoverflow.com/questions/18147338/twitter-bootstrap-3-0-icon-change-on-collapse
 * http://getbootstrap.com/javascript/#collapse
 * http://www.bootply.com/73101
 */
$('#sidebar-navigation')
    .on('show.bs.collapse', function (e) {
        if ($(e.target).hasClass('sidebar'))
            $("#page-wrapper").css("margin-left", "250px");
    })
    .on('hide.bs.collapse', function (e) {
        if ($(e.target).hasClass('sidebar'))
            $("#page-wrapper").css("margin-left", "0px");
    });
