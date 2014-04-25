module.exports = function (grunt) {

  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);


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
    open: {
      server: {
        url: 'http://localhost:<%= express.options.port %>'
      }
    },
    express: {
      options: {
        port: process.env.PORT || 3000
      },
      dev: {
        options: {
          script: 'server.js',
          debug: true
        }
      }
    },
    copy: {
      client: {
        files: [
          { expand: true, cwd: '../dashup-angular-client/dist/', src: [ '**' ], dest: 'public/' },
        ]
      }
    },
    watch: {
      livereload: {
        files: [
          'lib/views/**/*',
          'public/**/*'
        ],
        options: {
          livereload: true
        }
      },
      client: {
        files: [ '../dashup-angular-client/dist/**' ],
        tasks: [ 'copy:client' ]
      },
      express: {
        files: [
          'server.js',
          'lib/**/*.js',
          'config/*.js'
        ],
        tasks: [ 'express:dev' ],
        options: {
          livereload: true,
          nospawn: true
        }
      }
    }
  });

  grunt.registerTask('test', [ 'jasmine_node' ]);

  grunt.registerTask('serve', [ 'express:dev', 'open', 'watch' ]);

  grunt.registerTask('default', [ 'test' ]);
};
