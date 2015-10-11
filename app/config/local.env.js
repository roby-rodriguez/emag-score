/**
 * Constants module
 *
 * Created by johndoe on 20.09.2015.
 */
module.exports = {
    /** todo Replace by appropriate env variables such as process.env.IP, PORT */
    DOMAIN: 'http://localhost:1337',
    /** base emag source url */
    EMAG_BASE_URL: 'http://www.emag.ro',
    /** emag recaptcha API public key - assume it doesn't change */
    EMAG_RECAPTCHA_PUBLIC_KEY: '6LdYnNESAAAAAJIiPTuRX5FjzwbUOPqz31ju7VTc',
    /** recaptcha API source base URL */
    RECAPTCHA_CHALLENGE_BASE_URL: 'http://www.google.com/recaptcha/api/noscript?k=',
    /** recaptcha API source base URL */
    RECAPTCHA_IMAGE_BASE_URL: 'http://www.google.com/recaptcha/api/image?c=',
    /** secret key used for encryption in authentication */
    SESSION_SECRET: 'top.secret.key',
    /** when true, parallel requests are made, otherwise products are fetched sequentially (slower, but less likely for captchas to occur) */
    SCANNER_METHOD_FAST: true,
    /** interval of time in seconds elapsed between subsequent grab product requests */
    SCANNER_METHOD_SEQUENTIAL_TIMEOUT: 3,
    /** online captcha solving service app key */
    CAPTCHA_SERVICE_APP_KEY: '',
    /** number of attempts of solving the captcha challenge */
    CAPTCHA_SOLVE_ATTEMPTS: 3
};