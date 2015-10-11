/**
 * Captcha solver service.
 * It uses an online captcha solving service, by uploading the captcha URL it then
 * receives the decoded text and unlocks the captcha blocking page, allowing further processing.
 *
 * Created by johndoe on 08.10.2015.
 */
var Antigate = require('antigate');
var request = require('request');
var Constants = require('../config/local.env') ;

var CaptchaSolver = {
    ag: new Antigate(Constants.CAPTCHA_SERVICE_APP_KEY),
    solve: function (recaptchaChallenge, callback) {
        // fake some headers
        var headers = {
            'User-Agent'        : 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36',
            'Content-Type'      : 'application/x-www-form-urlencoded',
            'Accept'            : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding'   : 'gzip, deflate',
            'Accept-Language'   : 'en-US,en;q=0.8'
        };
        // configure request
        function options(challenge, solvedCaptchaText) {
            return {
                url: Constants.EMAG_BASE_URL + '/validate_captcha',
                method: 'POST',
                headers: headers,
                form: {
                    done: 'done',
                    recaptcha_challenge_field: challenge,
                    recaptcha_response_field: solvedCaptchaText
                }
            }
        }
        /**
         * Call antigate (online captcha solving service) and upon response post received data to source for
         * captcha validation
         */
        CaptchaSolver.ag.processFromURL(Constants.RECAPTCHA_IMAGE_BASE_URL + recaptchaChallenge, function (error, text) {
            console.log('Captcha challenge: ' + recaptchaChallenge);
            if (error || !text) {
                console.log('Error (antigate): ' + error);
                // todo 2 when captcha service fails to solve
                callback(error, null);
            } else {
                // post captcha to main site and continue rip
                request(options(recaptchaChallenge, text), function (error, response, body) {
                    if (error) {
                        console.error('Error (validate captcha post): ' + error);
                        // todo 3 when captcha service solution is wrong - check out what error codes we get from emag
                        callback(error, null);
                    } else {
                        console.info('Captcha challenge solved');
                        callback(null, {});
                    }
                })
            }
        });
    }
};

module.exports = CaptchaSolver;