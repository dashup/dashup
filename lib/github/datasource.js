var _ = require('lodash');


function DataSource(github) {

  function wrapFn(target, method) {

    function get(message, done) {
      console.log('fetch initial page');
      target[method](message, done);
    }

    return function(message, options, done) {
      
      var result = {},
          pages = [];

      var fetch = options.fetch;


      function fetchNext(currentPage, done) {

        if (fetch == 'previous') {

          console.log('checking for previous page');

          if (github.hasLastPage(currentPage)) {
            console.log('fetch previous page');

            return github.getLastPage(currentPage, done);
          }

          console.log('no previous page');
        } else
        if (fetch == 'next') {

          console.log('checking for next page');

          if (github.hasNextPage(currentPage)) {
            console.log('fetch next page');
            return github.getNextPage(currentPage, done);
          }

          console.log('no next page');
        }

        done();
      }


      function next(last) {


        function complete(err, page) {

          if (!page) {
            // we are done
            console.log('done fetching pages');
            return done(null, _.extend(result, { data: _.flatten(pages) }));
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
  this.getRepositoryEvents = wrapFn(github.events, 'getFromRepo');
  this.getOrganizationEvents = wrapFn(github.events, 'getFromOrg');
  this.getRepositoryIssueEvents = wrapFn(github.events, 'getFromRepoIssues');
}


module.exports = DataSource;
