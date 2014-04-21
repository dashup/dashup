(function(angular) {

  var module = angular.module('dashub.about', []);


  module.config([ '$routeProvider', function($routeProvider) {

    $routeProvider.when('/about', {
      templateUrl: 'js/about/view.html'
    });
  }]);

})(window.angular);