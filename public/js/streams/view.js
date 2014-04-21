(function(angular) {

  var module = angular.module('dashub.streams');

  var Controller = function($scope, $routeParams) {
    $scope.streamId = $routeParams.streamId;
  };

  module.config([ '$routeProvider', function($routeProvider) {

    $routeProvider.when('/s/:streamId', {
      reloadOnSearch: false,
      templateUrl: 'js/streams/view.html',
      controller: Controller
    });

  }]);

})(window.angular);