/**
 * Scheduled scan job
 *
 * Links:
 * http://stackoverflow.com/questions/20499225/i-need-a-nodejs-scheduler-that-allows-for-tasks-at-different-intervals
 * Cron seems nice but also check out Agenda:
 * https://github.com/rschmukler/agenda
 */
var cron = require('cron');
var execFile = require('child_process').execFile;
var Scanner = require('./app/business/scan');
var Constants = require('./app/config/local.env');

/**
 * Runs the scanner job every day of the month at 00:15 local time.
 * If captchas encountered, unfinished categories/products will be scanned in
 * subsequent attempts, after 30mins, 2 hours and 4 hours and a half.
 * On cloud9io UTC time is taken into consideration.
 *
 * TODO make it work properly
 * TODO extend to add support for notifications to users - user should grab
 * notifications when logging in - the system doesn't send them, it just stores
 * them in a collection
 */
var cronJob = cron.job("48 10 * * *", function() {
    var remainder = [], i = 0;
    function attempt(index) {
        setTimeout(function () {
            if (remainder.length == 0) {
                console.info('[SCANNER-JOB] finished scan everything at: ' + new Date().toString());
                execFile('./app/scripts/stop.sh');
            } else {
                console.info('[SCANNER-JOB] attempt ' + index + ' to finish scan: ' + new Date().toString());
                prepareScanJob(function() {
                    if (index <= Constants.SCAN_ATTEMPTS) {
                        var oldRemainder = remainder.slice();
                        remainder = [];
                        Scanner.scanEverything(oldRemainder, function (remainingProductUrls) {
                            remainder = remainder.concat(remainingProductUrls);
                        });
                        attempt(++index);
                    }
                });
            }
            //}, Math.pow(index, 2) * 30 * 60 * 1000);
        }, 10 * 60 * 1000);
    }
    /**
     * This is used as a workaround to enable preparation for scan.
     * TODO see why exec callback is not executed
     */
    function prepareScanJob(callback) {
        execFile('./app/scripts/start.sh');
        setTimeout(callback, 1000);
    }

    console.info('[SCANNER-JOB] started scan everything at: ' + new Date().toString());
    prepareScanJob(function() {
        Scanner.scanEverything(function (remainingProductUrls) {
            remainder = remainder.concat(remainingProductUrls);
        });
    });
    //FIXME this is ugly - find an efficient way to keep track of processed/failed on each circuit
    attempt(++i);
});
process.on('uncaughtException', function(err) {
    console.error('Encountered error: ' + err);
});
cronJob.start();