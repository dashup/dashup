(function(angular) {

  var app = angular.module('dashub', [ 'ngRoute', 'dashub.streams', 'dashub.about', 'dashub.home' ]);

  app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
  }]);

})(window.angular);