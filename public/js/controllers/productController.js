/**
 * Created by robaa on 10.07.2015.
 */
angular.module('emagScoresApp').controller('ProductController', function($scope, ProductFactory) {
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