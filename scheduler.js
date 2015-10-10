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
 *
 * TODO extend to add support for notifications to users
 */
var cronJob = cron.job("15 00 * * *", function(){
    console.info('[SCANNER-JOB] started scan everything at: ' + new Date().toString());
    Scanner.scanEverything(function (processed, failed, notFound) {
        console.info('[SCANNER-JOB] finished scan everything at: ' + new Date().toString());
        processed.forEach(function (doc, index) {
            console.log("Remainder " + index  +": " + doc.name);
        });
        failed.forEach(function (doc, index) {
            console.log("Remainder " + index  +": " + doc.name);
        });
        notFound.forEach(function (doc, index) {
            console.log("Not found " + index  +": " + doc.name);
        });
    });
});
cronJob.start();