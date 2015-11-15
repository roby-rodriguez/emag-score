/**
 * Created by johndoe on 15.11.2015.
 */
angular.module('emagScoreApp')
    .controller('ProductSearchController', function($location, $scope, $log, ProductFactory, ProductSearchFactory, ProductService) {
        // de delegat display projects direct in paginator

        // la ng-keyup enter sa fac un redirect sau ceva care sa schimbe controlleru

        //todo ar trebui pus direct pe scop cum era nainte
        // dar din cauza la redirect dispare
        // evt de pus HomeController pe menubar la searchInputEnter

        $scope.getProducts = function () {
            return ProductFactory.getProducts();
        };
        $scope.getPaginator = function () {
            return ProductFactory.getPaginator();
        };

        $scope.pageChanged = function() {
            $log.log("Changed to 2: " + ProductFactory.getPaginator().currentPage);
            //todo remove this type bullshit - use controller inheritance
            $scope.displayProducts();
        };

        $scope.displayProducts = function () {
            ProductService.searchProducts(ProductSearchFactory.getSearchKeyword(), ProductFactory.getPaginator().currentPage, ProductFactory.getPaginator().resultsPerPage)
                .then(function (json) {
                    // promise fulfilled
                    ProductFactory.setProducts(json);
                }, function(error) {
                    // display error message in UI
                });
        };

        $scope.retrieveTotalNrOfProducts = function (type, keyword) {
            ProductService.retrieveTotalNrOfProducts({ type : type, keyword : keyword })
                .then(function (total) {
                    // promise fulfilled
                    ProductFactory.setTotalPages(total);
                }, function(error) {
                    // display error message in UI
                });
        };

        // reset pagination
        ProductFactory.setCurrentPage(1);
        // todo fix this bullshit in retriever
        $scope.retrieveTotalNrOfProducts('title', ProductSearchFactory.getSearchKeyword());
        $scope.displayProducts();
    });