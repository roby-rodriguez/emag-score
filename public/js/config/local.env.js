/**
 * Created by johndoe on 12.11.2015.
 */
var apiEndpoint = 'http://localhost:1337';
module.exports = {
    apiEndpoint : apiEndpoint,
    categoriesUrl : apiEndpoint + '/categories',
    productsUrl : apiEndpoint + '/products',
    retrieveProductsUrl : apiEndpoint + '/products/retrieve/',
    searchProductsUrl : apiEndpoint + '/products/search/',
    countProductsUrl : apiEndpoint + '/products/total/',
    addFavoriteUrl : apiEndpoint + '/secured/favorites/add',

    emagBase : 'http://www.emag.ro'
};