'use strict';

var _ = require('lodash');

var utils = require('../utils');


function DataSource(github) {

  function wrapFn(target, method, name) {

    var log = utils.logger('datasource', '[' + name + ']');

    function get(message, done) {
      log('fetch initial page');
      target[method](message, done);
    }

    return function(message, options, done) {

      var result = {},
          pages = [];

      var fetch = options.fetch;


      function fetchNext(currentPage, done) {

        if (fetch == 'previous') {

          log('check previous page');

          if (github.hasLastPage(currentPage)) {
            log('fetch previous page');

            return github.getLastPage(currentPage, done);
          }

          log('no previous page');
        } else
        if (fetch == 'next') {

          log('check next page');

          if (github.hasNextPage(currentPage)) {
            log('fetch next page');
            return github.getNextPage(currentPage, done);
          }

          log('no next page');
        }

        done();
      }


      function next(last) {


        function complete(err, page) {

          if (!page) {
            // we are done
            log('done');
            return done(null, _.extend(result, { data: pages }));
          }

          pages.push(page);

          next(page);
        }

        if (!last) {

          // fetch meta data in first request
          get(message, function(err, data) {
            if (data && data.meta) {
              result.meta = _.extend({}, data.meta);
            }

            complete(err, data);
          });
        } else {
          fetchNext(last, complete);
        }
      }

      next();
    };
  }

  // API
  this.getRepositoryEvents = wrapFn(github.events, 'getFromRepo', 'repo-events');
  this.getOrganizationEvents = wrapFn(github.events, 'getFromOrg', 'org-events');
  this.getRepositoryIssueEvents = wrapFn(github.events, 'getFromRepoIssues', 'repo-issue-events');
}


module.exports = DataSource;