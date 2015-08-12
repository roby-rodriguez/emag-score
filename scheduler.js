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

var cronJob = cron.job("0 */1 * * * *", function(){
    // run job every minute
    console.info('cron hello world!');
});
cronJob.start();