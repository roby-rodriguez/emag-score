/**
 * Created by robaa on 10.07.2015.
 */
angular.module('emagScoresApp').controller('ProductController', function($scope, ProductFactory) {
    var vm = this;

    vm.product = ProductFactory.getProduct();

    /*
    vm.productHistoryChart = new Morris.Area({
        element: 'productHistoryChart',
        data: vm.product.history,
        xkey: 'Time',
        ykeys: ['Price'],
        labels: [vm.product.name]
    });
    */
});