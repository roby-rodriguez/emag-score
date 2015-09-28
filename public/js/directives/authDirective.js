/**
 * Created by johndoe on 26.09.2015.
 *
 * Transclusion is needed to allow authorization to be called before ng-click.
 * Apparently priority doesn't fix this, as ng-click always gets called first (i.e.
 * before the authorization link function)
 */
angular.module('emagScoreApp').directive('authorization' , function () {
    return {
        template: '<div ng-transclude></div>',
        transclude: true,
        restrict: 'A',
        controller: 'AuthController',
        link: function (scope, elem, attrs, ctrl) {
            $(elem).children(':first').on('click', function (e) {
                if (!scope.isAuthenticated()) {
                    scope.showPopup(scope.actionType.LOGIN);
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        }
    };
});