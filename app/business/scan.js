// scanner for emag.ro
var request = require('request');
var cheerio = require('cheerio');

var Scanner = {
    count: 0,
    products: [],
    productsUrl: "http://www.emag.ro/telefoane-mobile/p$/c?pc=60",

    /**
     * Parallelized GET @ http://www.emag.ro/{category}/p{index}/c?pc=60
     *
     * category -> ex. telefoane-mobile
     * index -> given by html text of last .emg-pagination-no
     */
    scan: function() {
        request({
            //proxy: "http://proxy.msg.de:3128",
            url: Scanner.productsUrl.replace("$", "1"),
            method: "GET"
        }, function(error, response, html) {
            if (!error) {
                //var pages = getPaginatorPages(html, 'emg-pagination-no');
                html = html.substring(html.indexOf('<div id="products-holder"'));
                html = html.substring(0, html.indexOf('<section') - 1);
                var $ = cheerio.load(html);

                $('.product-holder-grid').each(function () {
                    var pid = $(this).find("input[name='product[]']").val();
                    //var baseJson = $(this).find('input.dl_info').val();
                    var productObj = $(this).find('a.link_imagine');
                    var name = productObj.attr('title');
                    var brand = getWord(2, name);
                    var priceObject = $(this).find('span.price-over');
                    var price = Number(priceObject.find('.money-int').text()) + Number(priceObject.find('.money-decimal').text())/100;
                    var currency = priceObject.find('.money-currency').text().toLowerCase();
                    var productLink = productObj.attr('href');
                    var imgLink = $(this).find('span.image-container img').attr('src');
                    var ratingObject = $(this).find('.holder-rating');
                    //var ratingScore = ratingObject.next().next().next().attr('style');
                    var ratingScore = ratingObject.find('.star-rating-small-progress').css('width');
                    ratingScore = Number(ratingScore.substring(0, ratingScore.length - 1));
                    var ratings = Number(ratingObject.text().match(/\d/g).join(""));
                    var available = $(this).find('.stare-disp-listing').text().indexOf('In stoc') > -1 ? 1 : 0;
                    var details = $(this).find('.feedback-right-msg').text().trim().replace(/\s+/g, " ");
                });
                //console.log("page 1: " + Scanner.products);
                //for (var i = 2; i <= parseInt(pages); i++) {
                    /*
                    request({
                        proxy: "http://proxy.msg.de:3128",
                        url: Scanner.productsUrl.replace("$", i.toString()),
                        method: "GET"
                    }, function(error, response, json) {
                        if (!error) {
                            var productsHolder = html.substring(html.indexOf('<div id="products-holder"'), html.indexOf('<section') - 1);
                            var $ = cheerio.load(productsHolder);
                            var products = JSON.parse(JSON.stringify(getJsonString(json, 'impressions')));
                            //console.log("page " + Scanner.count++ + ": " + products);
                            Scanner.products.concat(products);
                        }
                    })
                    */
                //}
            }
        });
    },
    /**
     * Parallelized GET @ http://www.emag.ro/{category}/p{index}/c?pc=60
     *
     * category -> ex. telefoane-mobile
     * index -> given by html text of last .emg-pagination-no
     */
    rescan: function(category) {
        request({
            proxy: "http://proxy.msg.de:3128",
            url: Scanner.productsUrl.replace("$", "1"),
            method: "GET"
        }, function(error, response, json) {
            if (!error) {
                Scanner.products = JSON.parse(JSON.stringify(getJsonString(json, 'impressions')));
                //console.log("page 1: " + Scanner.products);
                var pages = getPaginatorPages(json, 'emg-pagination-no');
                for (var i = 2; i <= parseInt(pages); i++) {
                    request({
                        proxy: "http://proxy.msg.de:3128",
                        url: Scanner.productsUrl.replace("$", i.toString()),
                        method: "GET"
                    }, function(error, response, json) {
                        if (!error) {
                            var products = JSON.parse(JSON.stringify(getJsonString(json, 'impressions')));
                            //console.log("page " + Scanner.count++ + ": " + products);
                            Scanner.products.concat(products);
                        }
                    })
                }
            }
        });
    }
};

/**
 * Chops a {keyword} json out of the given {html}
 *
 * @param html
 * @param keyword
 * @returns {Blob|ArrayBuffer|string|Query}
 */
function getJsonString(html, keyword) {
    var index = html.lastIndexOf(keyword);
    html = html.slice(index);
    return html.slice(html.indexOf('[') + 1, html.indexOf(']'));
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