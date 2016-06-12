/**
 * main scanner for emag.ro
 *
 * Links:
 * http://www.bennadel.com/blog/2169-where-does-node-js-and-require-look-for-modules.htm
 * http://stackoverflow.com/questions/10860244/how-to-make-the-require-in-node-js-to-be-always-relative-to-the-root-folder-of-t
 *
 * Check this out:
 * http://stackoverflow.com/questions/23074901/express-making-multiple-http-requests-asynchronously
 * http://stackoverflow.com/questions/13906357/making-multiple-requests-and-passing-them-to-a-template-express-node-js-fb
 */
var request = require('request');
var cheerio = require('cheerio');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Product  = require('../model/product');
var Category  = require('../model/category');
var CaptchaSolver = require('./captchaSolver');
var Constants = require('../config/generated/env');

var Scanner = {
    ProductsHtmlType : { GRID: 0, FIGURE: 1 },
    ScanStatus: { FOUND: 0, NOT_FOUND: 1, FAILED: -1 },
    productsUrl: function () {
        return Constants.EMAG_BASE_URL + "/$0/p$1/c?pc=60";
    },
    /**
     * Scans all products
     *
     * @param done callback for when ready
     * @param categories [optional] categories to scan, otherwise those from db are used
     */
    scanEverything: function (done, categories) {
        function captchaCheck(html) {
            return html.indexOf("human_check") > -1;
        }
        function extractRecaptchaChallenge(html, callback) {
            //console.log('\n' + html + '\n');
            request.get(Constants.RECAPTCHA_CHALLENGE_BASE_URL + Constants.EMAG_RECAPTCHA_PUBLIC_KEY, function(error, response, html) {
                if (error)
                    callback(error, null);
                else {
                    var $ = cheerio.load(html);
                    var recaptchaChallenge = $('input#recaptcha_challenge_field').val();
                    if (!recaptchaChallenge)
                        callback(new Error('recaptcha_challenge_field not found'), null);
                    else
                        callback(null, recaptchaChallenge);
                }
            });
        }
        function ProductScanner(url, category, manager) {
            EventEmitter.call(this);
            this.url = url;
            this.category = category;
            this.manager = manager;
        }
        util.inherits(ProductScanner, EventEmitter);
        ProductScanner.prototype.scan = function (starter) {
            function grabProduct() {
                var self = this;
                // the requests are forwarded to the peasant proxy router which directs them into the tor circuits
                try {
                    request({
                        url: this.url
                    }, function(error, response, html) {
                        if (error)
                            self.manager.emit('error', error, self);
                        else if (captchaCheck(html)) {
                            extractRecaptchaChallenge(html, function (error, challenge) {
                                if (error)
                                    self.manager.emit('error', error, self);
                                else {
                                    self.manager.emit('captcha', challenge, self);
                                }
                            });
                        } else {
                            if (starter) {
                                var total = getPaginatorPages(html, 'emg-pagination-no');
                            }
                            var json = grabProducts(html, self.category.name);
                            self.emit('ready', json, total);
                        }
                    });
                } catch (error) {
                    self.manager.emit('error', error, this);
                }
            }
            // if captcha flag set block this scan and wait until captcha is solved
            if (this.manager.encounteredCaptcha) {
                this.manager.on('resume', function () {
                    grabProduct.call(this);
                });
            } else {
                grabProduct.call(this);
            }
            return this;
        };
        function CategoryScanner(category, manager) {
            EventEmitter.call(this);
            this.category = category;
            this.manager = manager;
            this.products = [];
        }
        util.inherits(CategoryScanner, EventEmitter);
        /**
         * check out these links:
         * http://stackoverflow.com/questions/14020697/nodejs-how-to-handle-event-listening-between-objects
         * http://stackoverflow.com/questions/26465358/how-to-make-an-eventemitter-listen-to-another-eventemitter-in-node-js
         */
        CategoryScanner.prototype.scan = function () {
            console.log('Scanning category: ' + this.category.name);
            var self = this;
            var first = new ProductScanner(Scanner.productsUrl().replace("$0", this.category.name).replace("$1", 1),
                this.category, this.manager);
            first
                .scan(true)
                .on('ready', function (json, total) {
                    self.total = self.total || total;
                    if (self.total > Constants.SCANNER_MAX_CATEGORY_SIZE) {
                        self.emit('ready', []);
                        console.log('Ignoring/Finished category: ' + self.category.name);
                        // todo update category delete or set irrelevant
                    } else if (self.total > 1) {
                        for (var finishedCounter = 1, i = 2; i <= self.total; i++) {
                            var additional = new ProductScanner(Scanner.productsUrl().replace("$0", self.category.name)
                                .replace("$1", i), self.category, self.manager);
                            additional
                                .scan()
                                .on('ready', function (json) {
                                    self.products = self.products.concat(json);
                                    if (++finishedCounter == self.total) {
                                        self.emit('ready');
                                        console.log('Finished category: ' + self.category.name);
                                        Product.saveBulkProducts(self.products);
                                    }
                                });
                        }
                    } else {
                        self.emit('ready');
                        console.log('Finished category: ' + self.category.name);
                        Product.saveBulkProducts(json);
                    }
                });
            return this;
        };
        function ScanManager(categories) {
            EventEmitter.call(this);
            this.categories = categories;
            // flag to limit the solving process to as few attepts as necessary
            this.encounteredCaptcha = false;
            // queue of products blocked by captcha, waiting for solution, who will then continue with a rescan
            this.captchaQueue = [];
            // this is somewhat redundant, for the case in which no online captcha solving service is used, multiple delayed scan attempts will be made
            this.captchaAffectedProductUrls = [];
            // keep track of number of attempts of solving the captcha challenge
            this.scanAttempts = 0;
        }
        util.inherits(ScanManager, EventEmitter);
        ScanManager.prototype.launch = function () {
            console.log('Started scan');
            var self = this;
            for (var finishedCounter = 0, i = 0; i < this.categories.length; i++) {
                var scanner = new CategoryScanner(this.categories[i], this);
                scanner
                    .scan()
                    .on('ready', function () {
                        if (++finishedCounter == self.categories.length) {
                            self.emit('ready');
                            console.log('Finished scan');
                        }
                    });
            }
            return this;
        };
        function parallel(docs, done) {
            var manager = new ScanManager(docs);
            manager
                .launch()
                .on('error', function (error, product) {
                    //todo add to failed/notFound
                    console.error('Encountered error at product: ' + product.url);
                    done([product.category.name]);
                })
                .on('captcha', function (challenge, product) {
                    // call captcha solver service and on success rescan
                    console.error('Encountered captcha at product: ' + product.url);
                    if (manager.encounteredCaptcha) {
                        // someone else has already encountered a captcha, enqueue product/challenge combination and wait for it to be solved
                        manager.captchaQueue.push({ product: product, recaptchaChallenge: challenge });
                        if (manager.captchaAffectedProductUrls.indexOf(product.category.name) == -1)
                            manager.captchaAffectedProductUrls.push(product.category.name);
                    } else {
                        manager.encounteredCaptcha = true;
                        CaptchaSolver.solve(challenge, function handleCaptchaResponse(error, result) {
                            if (error) {
                                // try again with next challenge in queue
                                if (++manager.scanAttempts <= Constants.CAPTCHA_SOLVE_ATTEMPTS) {
                                    CaptchaSolver.solve(manager.captchaQueue[manager.scanAttempts].recaptchaChallenge,
                                        handleCaptchaResponse);
                                } else {
                                    // well, most likely the online solving service is not working properly - abort
                                    console.log('Scan finished incompletely');
                                    done(manager.captchaAffectedProductUrls);
                                }
                            } else {
                                if (result) {
                                    manager.encounteredCaptcha = false;
                                    // rescan current and queued products
                                    product.scan();
                                    while (manager.captchaQueue.length) {
                                        var item = manager.captchaQueue.pop();
                                        item.product.scan();
                                    }
                                }
                                // resume blocked product scanners
                                manager.emit('resume');
                            }
                        });
                    }
                })
                .on('ready', function () {
                    // todo fillup processed / failed / notFound
                    done([]);
                    console.log('Finished everything');
                });
        }
        function sequential(docs, finishedCallback) {
            var json = [];
            (function iterativeSubcategoryScan(done) {
                var category = docs.pop();
                console.log('started subcat: ' + category.title);
                var total;
                var i = 1;
                (function iterativeProductScan(index, done) {
                    request({
                        url: Scanner.productsUrl().replace("$0", category.name).replace("$1", index.toString())
                    }, function(error, response, html) {
                        if (error) {
                            console.error('Encountered error');
                            // save products found so far
                            Product.saveBulkProducts(json);
                            finishedCallback(docs);
                        } else {
                            if (captchaCheck(html)) {
                                console.error('Encountered captcha');
                                // save products found so far
                                Product.saveBulkProducts(json);
                                finishedCallback(docs);
                            } else {
                                total = total || getPaginatorPages(html, 'emg-pagination-no');
                                json = json.concat(grabProducts(html, category.name));
                                if (index++ < total)
                                    setTimeout(iterativeProductScan(index, done), Constants.SCANNER_METHOD_SEQUENTIAL_TIMEOUT * 1000);
                                else
                                    done();
                            }
                        }
                    });
                }) (i, function finishedProductsCallback() {
                    console.log('finished all products for category: ' + category.title);
                    if (docs.length > 0)
                        iterativeSubcategoryScan(finishedProductsCallback);
                    else
                        done();
                });
            }) (function () {
                console.log('finished all');
                Product.saveBulkProducts(json);
                // todo fillup processed / failed / notFound
                finishedCallback([]);
            });
        }

        var scanMethod = (Constants.SCANNER_METHOD_FAST? parallel : sequential);
        if (categories !== undefined) {
            scanMethod(categories);
        } else {
            Category.getCategories(scanMethod, done);
        }
    },
    /**
     * Simple GET @ http://www.emag.ro/
     * fetches all product categories - looks for either emg-menu-child (name which is likely to change)
     * or <li><a href like '%/%s/c?%s%'
     */
    scanCategories: function() {
        function alreadyAdded(subcategory, json) {
            for (var i = json.length - 1; i >= 0; i--)
                if (json[i].name == subcategory)
                    return true;
            return false;
        }
        function trimHref(link) {
            link = link.substr(1);
            return link.substr(0, link.indexOf('/'));
        }
        /**
         * if href != js:void && (href contains c? || parent class contains child) -> add to subcategory
         *
         * @param link
         * @returns {*|boolean}
         */
        function validSubcategory(link) {
            var parentClass = link.parent().attr('class');
            var linkText = link.attr('href');
            return (link.children().length == 0 && link.text().length > 0)
                && ((parentClass && parentClass.indexOf('child') > -1) || (linkText && linkText.indexOf('c?') > -1));
        }
        request(Constants.EMAG_BASE_URL, function(error, response, html) {
            if (!error) {
                // grab main menu nav tag
                var json = [];
                var navMenuIndex = html.indexOf('<nav id="emg-mega-menu"');
                if (navMenuIndex > -1) {
                    html = html.substring(navMenuIndex);
                    html = html.substring(0, html.indexOf('</nav>') + 6);
                    var $ = cheerio.load(html);
                    $('a[href="javascript:void(0)"]').each(function () {
                        var self = $(this), title = self.text(), subcategories = [];
                        // skip recommended products section
                        if (title.toLowerCase().indexOf('recom') == -1) {
                            self.next().find('a').each(function () {
                                var link = $(this), subcategoryName = trimHref(link.attr('href'));
                                if (validSubcategory(link) && !alreadyAdded(subcategoryName, subcategories)) {
                                    subcategories.push({
                                        name: subcategoryName,
                                        title: link.text().trim(),
                                        active: true
                                    });
                                }
                            });
                        }
                        if (subcategories.length) {
                            json.push({
                                title: title.trim(),
                                subcategories: subcategories
                            });
                        }
                    });
                    if (json.length)
                        Category.saveBulkCategories(json);
                    // else // todo add error handling
                } else {
                    // nav container class name changed, load entire html and try to get lucky

                }
            } else {
                // todo add error handling
            }
        });
    }
};

function getFigureProducts(html, category) {
    var json = [];
    var $ = cheerio.load(html);
    $('figure').each(function () {
        var pid = extractNumber($(this).attr('id'));
        var imgLinkObj = $(this).find('img');
        var imgLink = './resources/img/product_na.jpg';
        if (imgLinkObj.length) imgLink = imgLinkObj.attr('data-src') || imgLinkObj.attr('src');
        var figCaptionObject = $(this).find('figcaption');
        if (figCaptionObject.length) {
            var productLinkObject = figCaptionObject.find('a'), productLink, name;
            if (productLinkObject.length) {
                productLink = productLinkObject.attr('href');
                name = productLinkObject.attr('title');
            }
            var priceObject = figCaptionObject.find('div.emg-listing-price');
            if (priceObject.length) {
                var price = Number(priceObject.find('.money-int').text().replace(/[^0-9]/, '')) + Number(priceObject.find('.money-decimal').text()) / 100;
                var currency = priceObject.find('.money-currency').text().toLowerCase();
            }
        }
        json.push({
            name: name,
            pid: pid,
            price: price,
            currency: currency,
            category: category,
            productLink: productLink,
            imageLink: imgLink,
            active: 1
        });
        // todo delete this debug print
        var last = json[json.length - 1];
        console.log("> "+ last.name + " " + last.pid + " " + last.price + " " + last.currency + " "
            + last.category + " " + last.productLink + " " + last.imageLink + " " + last.active);
    });
    return json;
}

function getGridProducts(html, category) {
    var json = [];
    var $ = cheerio.load(html);
    $('.product-holder-grid').each(function () {
        var pid = $(this).find("input[name='product[]']");
        if (pid.length) pid = pid.val();
        var productObj = $(this).find('a.link_imagine');
        if (productObj.length) {
            var name = productObj.attr('title');
        }
        var priceObject = $(this).find('span.price-over');
        if (priceObject.length) {
            var price = Number(priceObject.find('.money-int').text().replace(/[^0-9]/, '')) + Number(priceObject.find('.money-decimal').text()) / 100;
            var currency = priceObject.find('.money-currency').text().toLowerCase();
        }
        var productLink = productObj.attr('href');
        var imgLinkObj = $(this).find('img');
        var imgLink = './resources/img/product_na.jpg';
        if (imgLinkObj.length) imgLink = imgLinkObj.attr('data-src') || imgLinkObj.attr('src');
        var ratingObject = $(this).find('.holder-rating');
        if (ratingObject.length) {
            var ratingScore = ratingObject.find('.star-rating-small-progress');
            if (ratingScore.length) {
                ratingScore = ratingScore.css('width');
                ratingScore = Number(ratingScore.substring(0, ratingScore.length - 1));
            } else {
                ratingScore = null;
            }
            var ratings = ratingObject.text().match(/\d/g);
            if (ratings != null) ratings = Number(ratings.join(""));
        }
        var available = $(this).find('.stare-disp-listing');
        if (available.length) {
            if (available.text().toLowerCase().indexOf('indisponibil') > -1 || available.text().toLowerCase().indexOf('epuizat') > -1)
                available = 0;
            else
                available = 1;
        }
        var details = $(this).find('.feedback-right-msg');
        if (details.length) details = details.text().trim().replace(/\s+/g, " ");
        //todo don't add empty json strings/values, else it leads to circular ref errors
        json.push({
            "name": name,
            "pid": pid,
            "price": price,
            "currency": currency,
            "category": category,
            "productLink": productLink,
            "imageLink": imgLink,
            "ratingScore": ratingScore,
            "nrRatings": ratings,
            "active": available,
            "details": details
        });
        // todo delete this debug print
        var last = json[json.length - 1];
        console.log("> "+ last.name + " " + last.pid + " " + last.price + " " + last.currency + " "
            + last.category + " " + last.productLink + " " + last.imageLink + " " + last.ratingScore + " "
            + last.nrRatings + " " + last.active + " " + last.details);
    });
    return json;
}

/**
 *  Extracts products from html
 *
 * @param html the html holding the products grid
 * @param category the category to which the products belong to
 * @returns {Array} products json array
 */
function grabProducts(html, category) {
    var productsHtmlTypeObject = extractProductsHtml(html), json;
    if (Scanner.ProductsHtmlType.GRID == productsHtmlTypeObject.type)
        json = getGridProducts(productsHtmlTypeObject.html, category);
    else if (Scanner.ProductsHtmlType.FIGURE == productsHtmlTypeObject.type)
        json = getFigureProducts(productsHtmlTypeObject.html, category);
    else
        json = [];
    return json;
}

/**
 * Determines products area and extracts coresp. html
 * It uses very weak heuristics.
 *
 * @param html entire html content
 * @returns {object} products area html and type
 */
function extractProductsHtml(html) {
    var productsHtmlTypeObject = {};
    if (html.indexOf('<div id="products-holder"') > -1) {
        html = html.substring(html.indexOf('<div id="products-holder"'));
        html = html.substring(0, html.indexOf('<section') - 1);
        productsHtmlTypeObject.html = html;
        productsHtmlTypeObject.type = Scanner.ProductsHtmlType.GRID;
    } else if (html.indexOf('<section class="emg-col8 emg-center-container">') > -1) {
        html = html.substring(html.indexOf('<section class="emg-col8 emg-center-container">'));
        html = html.substring(0, html.substring(1).indexOf('<section'));
        productsHtmlTypeObject.html = html;
        productsHtmlTypeObject.type = Scanner.ProductsHtmlType.FIGURE;
    }
    return productsHtmlTypeObject;
}

/**
 * Extracts nr of pages from {html} given {
 *
 * @param html
 * @param paginatorCss
 * @returns {Number}
 */
function getPaginatorPages(html, paginatorCss) {
    var index = html.lastIndexOf(paginatorCss);
    html = html.slice(index);
    return extractNumber(html);
}

/**
 * Extracts a number from string
 *
 * @param html
 * @returns {Number}
 */
function extractNumber(html) {
    var found = html.match(/\d+/);
    return found? found[0] : 0;
}

/**
 * Extracts {category} from linkText
 *
 * @param linkText as /{category}/c?{%s}
 * @returns {*}
 */
function extractCategory(linkText) {
    var regex = /\/(.*)\/.\?/g;
    var arr = regex.exec(linkText);
    return arr != null ? arr[1] : null;
}

/**
 * Get the n-th word of text
 *
 * @param n
 * @param text
 * @returns {*}
 */
function getWord(n, text) {
    return text.split(" ")[n];
}

module.exports = Scanner;