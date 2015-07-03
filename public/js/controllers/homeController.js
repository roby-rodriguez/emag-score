/**
 * Created by robaa on 02.07.2015.
 */
angular.module('emagScoresApp').controller('HomeController', function($scope) {
    var vm = this;

    vm.products = [
        {
            "_id":"5592a0ec2b7b6a0b633f7aa4",
            "name":"Telefon mobil Samsung GALAXY S6 Edge, 32GB, Gold",
            "history":[
                {
                    "price":5799.9,
                    "dateRecorded":"2015-06-30T14:00:12.848Z"
                },
                {
                    "price":5799.9,
                    "dateRecorded":"2015-06-30T14:02:43.012Z"
                },
                {
                    "price":5799.9,
                    "dateRecorded":"2015-06-30T14:20:10.788Z"
                },
                {
                    "price":5799.9,
                    "dateRecorded":"2015-06-30T14:25:55.072Z"
                },
                {
                    "price":5799.9,
                    "dateRecorded":"2015-06-30T14:26:36.234Z"
                },
                {
                    "price":5799.9,
                    "dateRecorded":"2015-06-30T14:30:44.175Z"
                },
                {
                    "price":5799.9,
                    "dateRecorded":"2015-06-30T20:16:22.656Z"
                }
            ],
            "id":554272,
            "price":5799.9,
            "brand":"Samsung",
            "category":"Laptop, Tablete & Telefoane/Telefoane mobile & accesorii/Telefoane Mobile",
            "description":"Memorie interna:32 GB | Culoare:Auriu",
            "active":1
        },
        {
            "_id":"5592a0ec2b7b6a0b633f7aa5",
            "name":"Telefon mobil Apple iPhone 6, 16GB, Space Grey",
            "history":[
                {
                    "price":5599,
                    "dateRecorded":"2015-06-30T14:00:12.851Z"
                },
                {
                    "price":5599,
                    "dateRecorded":"2015-06-30T14:02:43.014Z"
                },
                {
                    "price":5599,
                    "dateRecorded":"2015-06-30T14:20:10.790Z"
                },
                {
                    "price":5599,
                    "dateRecorded":"2015-06-30T14:25:55.073Z"
                },
                {
                    "price":5599,
                    "dateRecorded":"2015-06-30T14:26:36.236Z"
                },
                {
                    "price":5599,
                    "dateRecorded":"2015-06-30T14:30:44.177Z"
                },
                {
                    "price":5599,
                    "dateRecorded":"2015-06-30T20:16:22.658Z"
                }
            ],
            "id":464909,
            "price":5599,
            "brand":"Apple",
            "category":"Laptop, Tablete & Telefoane/Telefoane mobile & accesorii/Telefoane Mobile",
            "description":"Memorie interna:16 GB | Culoare:Gri",
            "active":1
        }
    ];
});