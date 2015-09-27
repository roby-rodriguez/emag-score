/**
 * Created by johndoe on 23.08.2015.
 */
angular.module('emagScoreApp').controller('AuthController', function($scope, $modal, AuthService, AuthPopupFactory) {
    $scope.isAuthenticated = AuthService.isAuthenticated;
    // instead of using a factory we could've placed it on rootScope
    $scope.actionType = AuthPopupFactory;

    $scope.showPopup = function (type) {
        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'views/' + type + '.html',
            controller: 'AuthPopupController',
            size: 'lg'
        });
        modalInstance.result.then(function (selectedType) {
            if (selectedType)
                $scope.showPopup(selectedType);
        });
    };
    $scope.signout = function () {
        AuthService.logout();
    };
}).controller('AuthPopupController', function ($scope, $modalInstance, AuthService, AuthPopupFactory) {
    $scope.user = {};
    $scope.actionType = AuthPopupFactory;
    $scope.toggle = function (type) {
        $modalInstance.close(type);
    };
    $scope.signin = function () {
        AuthService.login($scope.user, function () {
                $modalInstance.close();
            }).error(function (err) {
                $scope.error = err;
            });
    };
    $scope.signup = function () {
        AuthService.register($scope.user, function () {
            $modalInstance.close();
        }).error(function (err) {
            $scope.error = err;
        });
    };
}).factory('AuthPopupFactory', function () {
    return {
        LOGIN: 'login',
        SIGNUP: 'signup',
        SIGNIN: 'signin',
        CLOSE: ''
    };
});