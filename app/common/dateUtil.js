/**
 * Created by johndoe on 16.08.2015.
 */
var DateUtil = {
    months : [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ],
    /**
     * Get a readable representation of current date as {string}
     *
     * @returns {string} readable representation of current date
     */
    getCurrentDate: function() {
        var date = new Date();
        return date.getDate() + '-' + this.months[date.getMonth()] + '-' + date.getFullYear();
    }
};

module.exports = DateUtil;