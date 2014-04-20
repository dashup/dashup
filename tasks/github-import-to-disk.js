var config = require('../lib/config'),
    github = require('../lib/github');

// import from github

var Importer = require('../lib/github/importer'),
    DataSource = require('../lib/github/datasource'),
    Data = require('../lib/tools/data');


var datasource = new DataSource(github),
    importer = new Importer(datasource);


function dataLoaded(element, source, sync, result) {

  console.log('data loaded', element.id, source);

  var meta = result.meta;
  
  if (meta.etag) {
    sync.etag = meta.etag;
  }

  sync.count++;
  sync.last = new Date();

  if (meta.status == '304 Not Modified') {
    console.log('not modified');
  } else {
    var name = 'data/events-' + element.id + '-' + source + '-' + sync.count + '.json';

    console.log('update, dumping result to', name);
    Data.dump(result.data, name);
  }
}


////// do stuff ///////////////////////////////////


var repositories = config.get('track.repositories', []);
var organizations = config.get('track.organizations', []);

var sync = config.get('track.sync', {});


// repository config

var repositorySources = [
  { name: 'base', method: 'getRepositoryEvents' },
  { name: 'issues', method: 'getRepositoryIssueEvents' }
];

importer.fetchAllEvents(repositories, sync, repositorySources, dataLoaded, function(err) {
  config.save();

  if (err) {
    return console.log('failed to fetch repository events');
  }

  console.log('fetching repository events completed');
});


// organization config

var organizationSources = [
  { name: 'base', method: 'getOrganizationEvents' }
];

importer.fetchAllEvents(organizations, sync, organizationSources, dataLoaded, function(err) {
  config.save();

  if (err) {
    return console.log('failed to fetch organization events');
  }

  console.log('fetching organization events completed');
});