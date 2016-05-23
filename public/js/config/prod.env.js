/**
 * Created by johndoe on 12.11.2015.
 */
var apiEndpoint = 'https://emag-score-roby-rodriguez.c9.io';
module.exports = {
    apiEndpoint : apiEndpoint,
    categoriesUrl : apiEndpoint + '/categories',
    productsUrl : apiEndpoint + '/products',
    retrieveProductsUrl : apiEndpoint + '/products/retrieve/',
    searchProductsUrl : apiEndpoint + '/products/search/',
    countProductsUrl : apiEndpoint + '/products/total/',
    
    retrieveFavoritesUrl: apiEndpoint + '/secured/favorites/',
    countFavoritesUrl: apiEndpoint + '/secured/favorites/total/',
    addFavoriteUrl : apiEndpoint + '/secured/favorites/add',
    removeFavoriteUrl: apiEndpoint + '/secured/favorites/remove',

    emagBase : 'http://www.emag.ro'
};