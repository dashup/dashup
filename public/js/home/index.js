(function(angular) {

  var module = angular.module('dashub.home', []);

  module.config([ '$routeProvider', function($routeProvider) {

    $routeProvider.when('/', {
      templateUrl: 'js/home/view.html'
    });

    $routeProvider.otherwise({
      redirectTo: '/'
    });

  }]);

})(window.angular);