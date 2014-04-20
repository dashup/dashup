(function(angular) {

  var app = angular.module('dashub', [ 'dashub.streams', 'elasticsearch' ]);

  app.config(function(StreamsProvider) {

    StreamsProvider.register('bpmn-io', {
      host: 'localhost:9200'
    });
  });

})(window.angular);