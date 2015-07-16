/**
 * main scanner for emag.ro
 *
 * Links:
 * http://www.bennadel.com/blog/2169-where-does-node-js-and-require-look-for-modules.htm
 * http://stackoverflow.com/questions/10860244/how-to-make-the-require-in-node-js-to-be-always-relative-to-the-root-folder-of-t
 */
var request = require('request');
var cheerio = require('cheerio');
var Product  = require('../model/product');

var Scanner = {
    productsUrl: "http://www.emag.ro/$0/p$1/c?pc=60",

    /**
     * Parallelized GET @ http://www.emag.ro/{category}/p{index}/c?pc=60
     *
     * category -> ex. telefoane-mobile
     * index -> given by html text of last .emg-pagination-no
     */
    scan: function(category) {
        request({
            url: Scanner.productsUrl.replace("$0", category).replace("$1", "1"),
            method: "GET"
        }, function(error, response, html) {
            if (!error) {
                // first we need to find out the number of pages (1 req/page)
                var pages = getPaginatorPages(html, 'emg-pagination-no');
                var json = grabProducts(html, category);

                for (var i = count = 2, total = parseInt(pages); i <= total; i++) {
                    request({
                        url: Scanner.productsUrl.replace("$0", category).replace("$1", i.toString()),
                        method: "GET"
                    }, function(error, response, html) {
                        if (!error) {
                            // concatenate subsequent json arrays
                            json = json.concat(grabProducts(html, category));
                            if (++count == total) {
                                /* json.foreach(function(doc, index) {
                                    console.log("product " + index + ": ");
                                    console.log(doc);
                                }); */
                                Product.saveBulkProducts(json);
                            }
                        }
                    });
                }
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
            var price = Number(priceObject.find('.money-int').text()) + Number(priceObject.find('.money-decimal').text()) / 100;
            var currency = priceObject.find('.money-currency').text().toLowerCase();
        }
        var productLink = productObj.attr('href');
        var imgLink = $(this).find('span.image-container img');
        if (imgLink.length) imgLink = imgLink.attr('src');
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
        json.push({
            "name": name,
            "id": pid,
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