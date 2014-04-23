module.exports = function (grunt) {
  
  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  var reloadPort = 35729;

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    develop: {
      server: {
        file: 'app.js'
      }
    },
    jasmine_node: {
      options: {
        specNameMatcher: '.*Spec',
        jUnit: {
          report: true,
          savePath : 'tmp/reports/jasmine',
          useDotNotation: true,
          consolidate: true
        }
      },
      spec: [ 'test/spec' ],
      integration: [ 'test/integration' ]
    },
    copy: {
      angularClient: {
        files: [
          { expand: true, cwd: '../dashup-angular-client/dist/', src: [ '**' ], dest: 'public/' },
        ]
      }
    },
    watch: {
      options: {
        livereload: reloadPort,
        nospawn: true
      },
      angularClient: {
        files: [ '../dashup-angular-client/dist/**' ],
        tasks: [ 'copy:angularClient' ]
      },
      server: {
        files: [
          'app.js',
          'app/**/*.js',
          'config/*.js'
        ],
        tasks: [ 'develop' ]
      }
    }
  });

  grunt.registerTask('test', [ 'jasmine_node' ]);

  grunt.registerTask('serve', [ 'develop', 'watch:angularClient' ]);

  grunt.registerTask('default', [ 'test' ]);
};
