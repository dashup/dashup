(function(angular, marked, moment) {

  var module = angular.module('dashub.streams');

  function ActivityStreamController($scope, Streams) {

    var stream;

    $scope.differentDate = function(a, b) {
      if (!b) {
        return true;
      }

      return moment(a.created_at).fromNow() !==
             moment(b.created_at).fromNow();
    };

    this.initStream = function(id) {
      if (!id) {
        throw new Error('no activity stream id given');
      }

      $scope.stream = stream = Streams.get(id);
      $scope.$emit('stream.init', stream);
    };

    function loadResults(results) {
      $scope.loading = false;
      $scope.streamData = results;
    }

    function handleError(error) {
      $scope.loading = false;

      $scope.error = {
        status: error.status,
        message: error.data && error.data.message ? error.data.message : error.data
      };
    }

    function reload() {
      $scope.loading = true;
      $scope.error = false;
      
      stream.search($scope.filter).then(loadResults, handleError);
    }

    // supported filters
    // 
    // fromDate, toDate, text, repo
    $scope.filter = {};

    $scope.$on('stream.init', function(e, stream) {
      reload();
    });

    $scope.$on('$destroy', function() {
      if (stream) {
        stream.destroy();
      }
    });
  }

  module.directive('dhActivityStream', function() {
    return {
      scope: {
        streamId: '='
      },
      controller: ActivityStreamController,
      templateUrl: 'js/streams/activityStream.html',
      link: function(scope, element, attrs, controller) {
        console.log(scope);
        controller.initStream(scope.streamId);
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
        commit: '=data',
        repo: '=repo'
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
        commit.shortSha = commit.sha.slice(0, 8);
      }
    };
  });

  module.directive('dhExpander', function() {
    return {
      templateUrl: 'js/streams/expander.html',

      link: function(scope, element, attrs) {

        element.on('click', function(e) {
          e.preventDefault();
          
          angular.element(this).parents('.event').find('.details').toggleClass('hidden');
        });
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