(function(angular) {

  var module = angular.module('dashub.streams');

  /**
   * A provider for streams configured for the application
   */
  module.provider('Streams', function() {

    var streams = {};

    this.register = function(name, config) {
      streams[name] = { config: config };
    };

    this.$get = [ 'esFactory', function(esFactory) {

      function getStream(name) {
        var stream = streams[name];

        if (!stream) {
          throw new Error('no stream <' + name + '> configured');
        }

        if (!stream.instance) {
          stream.instance = esFactory(stream.config);
        }

        return stream.instance;
      }

      return {
        
        /**
         * Returns the instance of the stream with the given name.
         * 
         * @method Streams#get
         *
         * @param {String} name
         * @type {Stream}
         */
        get: getStream
      };
    }];
  });

})(window.angular);