module.exports = function(grunt) {

  grunt.initConfig({
    mocha_istanbul: {
      coverage: {
        src: ["test"], // load used folders
        options: {
          mask: '**/*.js',
          excludes: ["**/test/**"], //we dont care about test coverage of our testing code
          print: "both", //prints both detailed and summary test data
          mochaOptions: [],
          istanbulOptions: ['--handle-sigint']
        }
      }
    },
    istanbul_check_coverage: {
      default: {
        options: {
          coverageFolder: 'coverage*', // will check both coverage folders and merge the coverage results
          check: {
            lines: 80,
            statements: 80
          }
        }
      }
    },
    jshint:{
      options:{
        esnext:true,
        curly: true,
        eqeqeq: true,
        node:true
      },
      all:["Gruntfile.js", "index.js", "lib/**/*.js"]
    },
    express: {
      options: {
        // Override defaults here
      },
      dev: {
        options: {
          script: './server.js'
        }
      },
      prod:{
        options:{
          scipts: ".server.js"
        }
      },
      test: {
        options: {
          script: './server.js',
          node_env: 'build-test'
        }
      }
    },
    watch: {
      express: {
        files: [ 'server.js'],
        tasks: ["express:dev:stop","express:dev"],
        options: {
          spawn: false
        }
      },
      client: {
        files: ['./client/*/*/*'],
        tasks: ["build"],
        options: {
          spawn: false,
          interval: 500,
          livereload: 35730
        }
      },
    },
    webpack:{
      build: {
	       // webpack options
	      entry: "./client/index.js",
	      output: {
		      path: "build/",
		      filename: "main.js",
	      },
        externals: ["request"],
        module:{
          loaders: [
          // the url-loader uses DataUrls.
          // the file-loader emits files.
            {test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff'},
            {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream'},
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'},
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml'}
          ]
        },
	      stats: {
		      colors: false,
		      modules: true,
		      reasons: true
	      },
        node: {
          fs: "empty",
          lapack: "empty"
        },
	      progress: true, // Don't show progress
	      failOnError: true, // don't report error to grunt if webpack find errors
	      watch: false, // use webpacks watcher
	      keepalive: false, // don't finish the grunt task
	      inline: false,  // embed the webpack-dev-server runtime into the bundle
	      hot: false // adds the HotModuleReplacementPlugin and switch the server to hot mode
      }
    }
  });

  //grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');
  //grunt.loadNpmTasks('grunt-contrib-copy');
  //grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks("grunt-webpack");
  grunt.registerTask('server', ['express:dev', 'watch']);
  //grunt.loadNpmTasks("grunt-run");
  //grunt.registerTask('jshint', ['jshint:all']);
  //grunt.registerTask('test', ['jshint', 'mocha_istanbul:coverage']);
  grunt.registerTask('build', ["webpack:build"]);
};
