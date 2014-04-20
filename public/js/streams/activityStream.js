(function(angular, marked, moment) {

  var module = angular.module('dashub.streams');

  function ActivityStreamController($scope, Streams) {

    var stream;

    $scope.differentDate = function(a, b) {
      if (!b) {
        return true;
      }

      return moment(a._source.created_at).fromNow() !==
             moment(b._source.created_at).fromNow();
    };

    this.initStream = function(name) {
      stream = Streams.get(name);
      $scope.$emit('stream.init', stream);
    };

    function loadResults(results) {
      console.log(arguments);
      $scope.results = results;
    }

    function handleError(error) {
      $scope.error = error;
    }

    $scope.$on('stream.init', function(e, stream) {

      stream.search({
        index: 'dashub',
        type: 'event-repo',
        size: '100',
        body: {
          query: {
            match_all: {}
          },
          sort: [
            { created_at: { order: 'desc' } },
          ]
        }
      }).then(loadResults, handleError);
    });
  }

  module.directive('dhActivityStream', function() {
    return {
      scope: {
        name: '@'
      },
      controller: ActivityStreamController,
      templateUrl: 'js/streams/activityStream.html',
      link: function(scope, element, attrs, controller) {
        controller.initStream(scope.name);
      }
    };
  });

  module.directive('dhEvent', function() {
    return {
      scope: {
        event: '=data'
      },
      templateUrl: 'js/streams/event.html'
    };
  });

  module.directive('dhUser', function() {
    return {
      scope: {
        user: '=data'
      },
      templateUrl: 'js/streams/user.html'
    };
  });

  module.directive('dhIssue', function() {
    return {
      scope: {
        issue: '=data'
      },
      templateUrl: 'js/streams/issue.html'
    };
  });

  module.directive('dhRepository', function() {
    return {
      scope: {
        repository: '=data'
      },
      templateUrl: 'js/streams/repository.html'
    };
  });

  module.directive('dhComment', [ '$sce', function($sce) {
    return {
      scope: {
        comment: '=data'
      },
      templateUrl: 'js/streams/comment.html',
      link: function(scope) {
        var comment = scope.comment;
        comment.body_html = $sce.trustAsHtml(marked(comment.body));
      }
    };
  }]);

  module.directive('dhTeam', function() {
    return {
      scope: {
        team: '=data'
      },
      templateUrl: 'js/streams/team.html'
    };
  });

  module.directive('dhRepo', function() {
    return {
      scope: {
        repo: '=data'
      },
      templateUrl: 'js/streams/repo.html'
    };
  });

  module.directive('dhRef', function() {
    return {
      scope: {
        ref: '=data',
        repo: '=repo'
      },
      templateUrl: 'js/streams/ref.html',
      link: function(scope) {
        var ref = scope.ref;

        ref.name = ref.ref.split(/\//).pop();
      }
    };
  });

  module.directive('dhCommit', function() {
    return {
      scope: {
        commit: '=data'
      },
      templateUrl: 'js/streams/commit.html',

      link: function(scope) {

        var commit = scope.commit,
            message = commit.message;

        var shortMessage = message.split(/\n\n/)[0];
        if (shortMessage.length > 80) {
          shortMessage = shortMessage.slice(0, 75) + '...';
        }

        commit.shortMessage = shortMessage;
      }
    };
  });

  module.filter('plain', function() {
    return function(input, strip) {
      return marked(input).replace(/<[^>]+>/g, '');
    };
  });

  module.filter('fromNow', function() {
    return function(input) {
      return moment(input).fromNow();
    };
  });
})(window.angular, window.marked, window.moment);