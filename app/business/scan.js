// scanner for emag.ro
var request = require('request');

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

module.exports = Scanner;