/**
 * Created by johndoe on 12.08.2015.
 */
/**
 * Links:
 * http://stackoverflow.com/questions/20499225/i-need-a-nodejs-scheduler-that-allows-for-tasks-at-different-intervals
 * Cron seems nice but also check out Agenda:
 * https://github.com/rschmukler/agenda
 */
var cron = require('cron');
var Scanner  = require('./app/business/scan');

/**
 * Runs the scanner job every day of the month at 00:15 local time.
 * If captchas encountered, unfinished categories/products will be scanned in
 * subsequent attempts, after 30mins, 2 hours and 4 hours and a half.
 * TODO extend to add support for notifications to users
 */
var cronJob = cron.job("15 00 * * *", function(){
    var NR_OF_ATTEMPTS = 3;
    function attempt(docs, indexObj) {
        setTimeout(function () {
            console.info('[SCANNER-JOB] attempt ' + indexObj.index + ' to finish scan: ' + new Date().toString());
            Scanner.scanEverything(function (failed, notFound) {
                if (failed.length > 0 && indexObj.index++ <= NR_OF_ATTEMPTS)
                    attempt(failed, indexObj);
            });
        }, Math.pow(indexObj.index, 2) * 30 * 60 * 1000);
    }
    console.info('[SCANNER-JOB] started scan everything at: ' + new Date().toString());
    Scanner.scanEverything(function (failed, notFound) {
        var indexObj = { index : 1 };
        failed.forEach(function (doc, index) {
            console.log("Remainder " + index  +": " + doc.name);
        });
        notFound.forEach(function (doc, index) {
            console.log("Not found " + index  +": " + doc.name);
        });
        if (failed.length > 0)
            attempt(failed, indexObj);
    });
});
cronJob.start();