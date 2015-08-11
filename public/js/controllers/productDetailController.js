/**
 * Controller for product detail view
 */
angular.module('emagScoresApp').controller('ProductDetailController', function($scope, ProductFactory) {
    var vm = this;

    vm.product = ProductFactory.getProduct();

    vm.productHistoryChart = new Morris.Area({
        element: 'productHistoryChart',
        data: vm.product.history,
        xkey: 'dateRecorded',
        ykeys: ['price'],
        labels: [vm.product.name],
        xLabels: 'day',
        parseTime: false,
        pointSize: 2,
        hideHover: 'auto',
        fillOpacity: 0.5,
        resize: true
    });
});