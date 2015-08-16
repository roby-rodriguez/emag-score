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
var Product  = require('../model/product');
var Category  = require('../model/category');

var Scanner = {
    baseUrl: "http://www.emag.ro",
    productsUrl: function () {
        return this.baseUrl + "/$0/p$1/c?pc=60";
    },
    /**
     * Parallelized GETs on all product categories
     *
     * TODO implement some simple protection against CAPTCHAs -> delays or smth
     */
    scanEverything: function (callback) {
        Category.getCategories(function (docs) {
            var failed = new Array();
            var index = 0;
            var total = getTotal(docs);
            docs.forEach(function (doc) {
                // only look for leaf category items
                if (doc.subcategories != null) {
                    doc.subcategories.forEach(function (sdoc) {
                        Scanner.scanProducts(sdoc.name, function (success) {
                            // check if current category has successfully been scanned
                            if (success) {
                                console.log("Finished category " + sdoc.name);
                            } else {
                                console.log("Could not finish category " + sdoc.name);
                                failed.push(doc);
                            }
                            if (++index == total)
                                callback(failed);
                            console.log("Index=" + index + " total=" + total);
                        });
                    });
                }
            });
        });
    },
    testScanEverything: function () {
        var json = [{name: "telefoane-mobile"}, {name: "laptopuri"}, {name: "tablete"}, {name: "procesoare"}, {name: "mediaplayere"}, {name: "carduri-memorie"}];
        json.forEach(function (doc, index) {
            Scanner.scanProducts(doc.name);
        });
    },
    /**
     * Parallelized GET @ http://www.emag.ro/{category}/p{index}/c?pc=60
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
                    console.log("F*** me I'm famous! -> CAPTCHA!");
                    callback(false);
                } else {
                    var pages = getPaginatorPages(html, 'emg-pagination-no');
                    var json = grabProducts(html, category);

                    if (pages == 1) {
                        // FIXME this is somehow redundant but necessary
                        if (json.length > 0)
                            Product.saveBulkProducts(json);
                        else
                            console.log("No products found/extracted for category: " + category);
                        callback(true);
                    } else if (pages > 1) {
                        for (var i = 2, count = 2, total = parseInt(pages); i <= total; i++) {
                            request({
                                url: Scanner.productsUrl().replace("$0", category).replace("$1", i.toString()),
                                method: "GET"
                            }, function (error, response, html) {
                                if (!error) {
                                    // concatenate subsequent json arrays
                                    console.log("Received html response " + count + " category: " + category);
                                    if (html.indexOf("human_check") > -1) {
                                        console.log("F*** me I'm famous! -> CAPTCHA!");
                                        callback(false);
                                    } else {
                                        json = json.concat(grabProducts(html, category));
                                        if (++count == total) {
                                            //json.forEach(function(doc, index) {
                                            //    console.log("product " + index + ": ");
                                            //    console.log(doc);
                                            //});
                                            if (json.length > 0) {
                                                Product.saveBulkProducts(json);
                                            } else
                                                console.log("No products found/extracted for category: " + category);
                                            callback(true);
                                        }
                                    }
                                } else
                                    console.log("Scan product request error: " + error);
                            });
                        }
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
        request({
            url: Scanner.baseUrl,
            method: "GET"
        }, function(error, response, html) {
            if (!error) {
                // grab main menu nav tag
                var json = new Array();
                var navMenuIndex = html.indexOf('<nav id="emg-mega-menu"');
                if (navMenuIndex > -1) {
                    html = html.substring(navMenuIndex);
                    html = html.substring(0, html.indexOf('</nav>') + 6);
                    var $ = cheerio.load(html);
                    $('li a[href="javascript:void(0)"]').each(function () {
                        var title = $(this).text(), lastParent;
                        // skip recommended products section
                        if (title.toLowerCase().indexOf('recomand') == -1) {
                            $(this).parent().find('a').each(function () {
                                var parentClass = $(this).parent().attr('class');
                                if (typeof parentClass !== 'undefined'
                                    && (parentClass.indexOf('title') > -1 || parentClass.indexOf('child') > -1)) {
                                    // found parent/expandable or child/leaf category
                                    // now extract category following {baseUrl}/{category}/c?{%s}
                                    var name = extractCategory($(this).attr('href'));
                                    if (name != null) {
                                        // sometimes links to unrelated/not grab-able pages may come up - should be avoided
                                        if (parentClass.indexOf('title') > -1) lastParent = name;
                                        if (parentClass.indexOf('child') > -1) {
                                            json[json.length - 1].subcategories = json[json.length - 1].subcategories || [];
                                            json[json.length - 1].subcategories.push({
                                                "name": name,
                                                "title": $(this).text()
                                            });
                                        } else {
                                            json.push({
                                                "name": name,
                                                "title": $(this).text()
                                            });
                                        }
                                    }
                                }
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

/**
 *  Extracts products from html and saves to db as json
 *
 * @param html the html holding the products grid
 */
function grabProducts(html, category) {
    var json = new Array();
    html = html.substring(html.indexOf('<div id="products-holder"'));
    html = html.substring(0, html.indexOf('<section') - 1);
    var $ = cheerio.load(html);

    $('.product-holder-grid').each(function () {
        var pid = $(this).find("input[name='product[]']");
        if (pid.length) pid = pid.val();
        var productObj = $(this).find('a.link_imagine');
        if (productObj.length) {
            var name = productObj.attr('title');
            var brand = getWord(2, name);
        }
        if (name.indexOf("ASUS ZenFone") > -1){
            name = name.substring(1);
        }
        var priceObject = $(this).find('span.price-over');
        if (priceObject.length) {
            var price = Number(priceObject.find('.money-int').text().replace(/[^0-9]/, '')) + Number(priceObject.find('.money-decimal').text()) / 100;
            var currency = priceObject.find('.money-currency').text().toLowerCase();
        }
        var productLink = productObj.attr('href');
        var imgLinkObj = $(this).find('img');
        var imgLink = './resources/img/product_na.jpg';
        //todo refine the line below -> search all attrs and extract text containing '.jpeg'/'.jpg'
        if (imgLinkObj.length) imgLink = imgLinkObj.attr('data-src');
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
        if (available.length) available = available.text().indexOf('In stoc') > -1 ? 1 : 0;
        var details = $(this).find('.feedback-right-msg');
        if (details.length) details = details.text().trim().replace(/\s+/g, " ");
        //todo don't add empty json strings/values, else it leads to circular ref errors
        json.push({
            "name": name,
            "pid": pid,
            "price": price,
            "currency": currency,
            "brand": brand,
            "category": category,
            "productLink": productLink,
            "imageLink": imgLink,
            "ratingScore": ratingScore,
            "nrRatings": ratings,
            "active": available,
            "details": details
        });
    });
    return json;
}

/**
 * Extracts nr of pages from {html} given {
 *
 * @param html
 * @param paginatorCss
 * @returns {Blob|ArrayBuffer|string|Query}
 */
function getPaginatorPages(html, paginatorCss) {
    var index = html.lastIndexOf(paginatorCss);
    html = html.slice(index);
    return html.match(/\d+/)[0];
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

module.exports = Scanner;