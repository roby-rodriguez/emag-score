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
var Constants = require('../config/local.env');

var Scanner = {
    ProductsHtmlType : { GRID: 0, FIGURE: 1 },
    ScanStatus: { FOUND: 0, NOT_FOUND: 1, FAILED: -1 },
    productsUrl: function () {
        return Constants.EMAG_BASE_URL + "/$0/p$1/c?pc=60";
    },
    /**
     * Parallelized GETs on all product categories
     *
     * !De facut un array de subcategorii, evit nesting-ul si duplicatele
     *
     * TODO implement some simple protection against CAPTCHAs -> delays/retry or smth
     */
    scanEverything1: function (callback, categories) {
        /**
         * Gets the total number of subcategories of the given category array
         *
         * @param docs category array
         * @returns {number} total number of subcategories
         */
        function getTotal(docs) {
            var total = 0;
            docs.forEach(function (doc) {
                if (doc.subcategories != null) {
                    doc.subcategories.forEach(function () {
                        ++total;
                    });
                }
            });
            return total;
        }
        function scanner(docs) {
            var processed = new Array();
            var failed = new Array();
            var notFound = new Array();
            var index = 0;
            var total = getTotal(docs);
            docs.forEach(function (doc) {
                // only look for leaf category items
                if (doc.subcategories != null) {
                    doc.subcategories.forEach(function (sdoc) {
                        Scanner.scanProducts(sdoc.name, function (docs, status) {
                            // check if current category has successfully been scanned
                            if (status == Scanner.ScanStatus.FOUND) {
                                console.log("Finished category " + sdoc.name);
                                processed = processed.concat(docs);
                            } else if (status == Scanner.ScanStatus.NOT_FOUND) {
                                console.log("Could not finish category");
                                if (notFound.indexOf(doc) == -1)
                                    notFound.push(doc);
                            } else {
                                console.log("Failed to finish category");
                                if (failed.indexOf(doc) == -1)
                                    failed.push(doc);
                            }
                            if (++index == total) {
                                console.log("Finished iteration over all categories");
                                Product.saveBulkProducts(processed);
                                callback(failed, notFound);
                            }
                            console.log("Index=" + index + " total=" + total);
                        });
                    });
                }
            });
        }

        // some voodoo stuff here but cool, check if this works
        if (categories !== undefined) {
            scanner(categories);
        } else {
            Category.getCategories(scanner);
        }
    },
    /**
     * Scans all products
     *
     * @param done callback for when ready
     * @param categories [optional] categories to scan, otherwise those from db are used
     */
    scanEverything: function (done, categories) {
        function captchaCheck(html) {
            return html.indexOf("captcha") > -1;
        }
        function extractRecaptchaChallenge(html, callback) {
            console.log('\n' + html + '\n');
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
        function getAllSubcategories(categories) {
            var result = [], visited = [];
            for (var i = categories.length - 1; i >= 0; i--) {
                for (var j = categories[i].subcategories.length - 1; j >= 0; j--) {
                    if (visited.indexOf(categories[i].subcategories[j].name) == -1) {
                        visited.push(categories[i].subcategories[j].name);
                        result.push(categories[i].subcategories[j]);
                    }
                }
            }
            return result;
        }
        function ProductScanner(url, category, manager) {
            EventEmitter.call(this);
            this.url = url;
            this.category = category;
            this.manager = manager;
        }
        util.inherits(ProductScanner, EventEmitter);
        ProductScanner.prototype.scan = function (starter) {
            var self = this;
            request.get(this.url, function(error, response, html) {
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
                    var json = grabProducts(html, self.category);
                    self.emit('ready', json, total);
                }
            });
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
                this.category.title, this.manager);
            first
                .scan(true)
                .on('ready', function (json, total) {
                    self.total = self.total || total;
                    if (self.total > 1) {
                        for (var finishedCounter = 1, i = 2; i <= self.total; i++) {
                            var additional = new ProductScanner(Scanner.productsUrl().replace("$0", self.category.name)
                                .replace("$1", i), self.category.title, self.manager);
                            additional
                                .scan()
                                .on('ready', function (json) {
                                    self.products = self.products.concat(json);
                                    if (++finishedCounter == self.total) {
                                        self.emit('ready', self.products);
                                        console.log('Finished category: ' + self.category.name);
                                    }
                                });
                        }
                    } else {
                        self.emit('ready', json);
                        console.log('Finished category: ' + self.category.name);
                    }
                });
            return this;
        };
        function ScanManager(categories) {
            EventEmitter.call(this);
            this.categories = categories;
            // products successfully processed
            this.products = [];
            // flag to limit the solving process to as few attepts as necessary
            this.encounteredCaptcha = false;
            // queue of products blocked by captcha, waiting for solution, who will then continue with a rescan
            this.captchaQueue = [];
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
                    .on('ready', function (json) {
                        self.products = self.products.concat(json);
                        if (++finishedCounter == self.categories.length) {
                            self.emit('ready');
                            console.log('Finished scan');
                            Product.saveBulkProducts(self.products);
                        }
                    });
            }
            return this;
        };
        function parallel(docs) {
            var processed = [], failed = [], notFound = [];
            var subcategories = getAllSubcategories(docs);
            var manager = new ScanManager(subcategories);
            manager
                .launch()
                .on('error', function (error, product) {
                    //todo add to failed/notFound
                    console.error('Encountered error at product: ' + product);
                })
                .on('captcha', function (challenge, product) {
                    // call captcha solver service and on success rescan
                    console.error('Encountered captcha at product: ' + product);
                    if (manager.encounteredCaptcha) {
                        // someone else has already encountered a captcha, enqueue product/challenge combination and wait for it to be solved
                        manager.captchaQueue.push({ product: product, recaptchaChallenge: challenge });
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
                                }
                            } else {
                                if (result) {
                                    // rescan current and queued products
                                    product.scan();
                                    while (manager.captchaQueue.length) {
                                        var item = manager.captchaQueue.pop();
                                        item.product.scan();
                                    }
                                }
                            }
                        });
                    }
                })
                .on('ready', function () {
                    // todo fillup processed / failed / notFound
                    done(processed, failed, notFound);
                    console.log('Finished everything');
                });
        }
        function sequential(docs) {
            var processed = [], failed = [], notFound = [];
            var json = [];
            var subcategories = getAllSubcategories(docs);
            (function iterativeSubcategoryScan(done) {
                var category = subcategories.pop();
                console.log('started subcat: ' + category.title);
                var total;
                var i = 1;
                (function iterativeProductScan(index, done) {
                    request(Scanner.productsUrl().replace("$0", category.name).replace("$1", index.toString()),
                        function(error, response, html) {
                            if (error) {
                                throw error;//todo
                            } else {
                                if (captchaCheck(html)) {
                                    console.error('Encountered captcha'); //todo
                                } else {
                                    total = total || getPaginatorPages(html, 'emg-pagination-no');
                                    json = json.concat(grabProducts(html, category.title));
                                    if (index++ < total)
                                        setTimeout(iterativeProductScan(index, done), Constants.SCANNER_METHOD_SEQUENTIAL_TIMEOUT * 1000);
                                    else
                                        done();
                                }
                            }
                        }
                    );
                }) (i, function finishedProductsCallback() {
                    console.log('finished all products for category: ' + category.title);
                    if (subcategories.length > 0)
                        iterativeSubcategoryScan(finishedProductsCallback);
                    else
                        done();
                });
            }) (function () {
                console.log('finished all');
                Product.saveBulkProducts(json);
                // todo fillup processed / failed / notFound
                done(processed, failed, notFound);
            });
        }

        var method = (Constants.SCANNER_METHOD_FAST? parallel : sequential);
        if (categories !== undefined) {
            method(categories);
        } else {
            Category.getCategories(method);
        }
    },
    testScanEverything: function () {
        //var json = [{name: "telefoane-mobile"}, {name: "laptopuri"}, {name: "tablete"}, {name: "procesoare"}, {name: "mediaplayere"}, {name: "carduri-memorie"}];
        //var json = [{name: "skateboard"}, {name: "drumetii"}, {name: "role"}, {name: "trotinete"}];
        var json = [{name: "telefoane-mobile"}];
        json.forEach(function (doc, index) {
            Scanner.scanProducts(doc.name, function (status) {
                if (status == Scanner.ScanStatus.FOUND) {
                    console.log("Finished category " + doc.name);
                } else if (status == Scanner.ScanStatus.NOT_FOUND) {
                    console.log("Could not finish category " + doc.name);
                } else {
                    console.log("Failed to finish category" + doc.name);
                }
            });
        });
    },
    /**
     * Parallelized GET @ http://www.emag.ro/{category}/p{index}/c?pc=60
     * TODO rewrite this
     *
     * @param category e.g. telefoane-mobile
     * index -> given by html text of last .emg-pagination-no
     * @param callback called when fully scanned or on error
     */
    scanProducts: function(category, callback) {
        request({
            url: Scanner.productsUrl().replace("$0", category).replace("$1", "1"),
            method: "GET"
        }, function(error, response, html) {
            if (!error) {
                // first we need to find out the number of pages (1 req/page)
                console.log("Requested category " + category);
                if (html.indexOf("human_check") > -1) {
                    console.log("F*** me I'm famous! -> CAPTCHA! (category: " + category + " 1)");
                    callback([], false);
                } else {
                    var status;
                    var pages = getPaginatorPages(html, 'emg-pagination-no');
                    var json = grabProducts(html, category);

                    // FIXME this is somehow redundant but necessary
                    if (json.length > 0)
                        if (pages > 1) {
                            for (var i = 2, count = 2, total = parseInt(pages); i <= total; i++) {
                                request(Scanner.productsUrl().replace("$0", category).replace("$1", i.toString()), function (error, response, html) {
                                    if (!error) {
                                        // concatenate subsequent json arrays
                                        console.log("Received html response " + count + " category: " + category);
                                        if (html.indexOf("human_check") > -1) {
                                            console.log("F*** me I'm famous! -> CAPTCHA! (category: " + category + " " + count + ")");
                                            callback([], Scanner.ScanStatus.FAILED);
                                        } else {
                                            json = json.concat(grabProducts(html, category));
                                            if (count++ == total) {
                                                //json.forEach(function(doc, index) {
                                                //    console.log("product " + index + ": ");
                                                //    console.log(doc);
                                                //});
                                                callback(json, Scanner.ScanStatus.FOUND);
                                            }
                                        }
                                    } else
                                        console.log("Scan product request error: " + error);
                                });
                            }
                        } else {
                            // only one page, so we finished already
                            callback(json, Scanner.ScanStatus.FOUND);
                        }
                    else {
                        // html/css changed, no need to make further requests
                        console.log("No products found/extracted for category: " + category);
                        callback([], Scanner.ScanStatus.NOT_FOUND);
                    }
                }
            } else {
                // todo add error handling
                console.log("Scan product request error: " + error);
            }
        });
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
            return (parentClass && parentClass.indexOf('child') > -1) || (linkText && linkText.indexOf('?c') > -1);
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
                            self.parent().find('a').each(function () {
                                var link = $(this), subcategoryName = trimHref(link.attr('href'));
                                if (validSubcategory(link) && !alreadyAdded(subcategoryName, subcategories)) {
                                    subcategories.push({
                                        name: subcategoryName,
                                        title: link.text()
                                    });
                                }
                            });
                        }
                        if (subcategories.length) {
                            json.push({
                                title: title,
                                subcategories: subcategories
                            });
                        }
                    });
                    Category.saveBulkCategories(json);
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