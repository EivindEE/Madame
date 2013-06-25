/*global module:false*/
module.exports = function (grunt) {
	"use strict";
	grunt.loadNpmTasks('grunt-linter');
	grunt.loadNpmTasks('grunt-contrib');
	grunt.loadNpmTasks('grunt-compass');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	var jsDir = 'public/js/',
		styleDir = 'public/stylesheets/';

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		meta: {
			banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
				' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
		},
		linter: {
			'files': [
				'grunt.js',
				'public/js/*.js',
				'testing/**/*.js',
				'app/*.js',
				'app/**/*.js',
				'app.js',
				'routes/**.js'
			],
			directives: {
				'browser': true,
				'node': true
			},
			globals: {
				'jQuery': true
			}
		},
		cssmin: {
			'files': {
				'public/stylesheets/style.min.css': [
					styleDir + 'reset.css',
					styleDir + 'bootstrap.css',
					styleDir + 'style.css'
				]
			}
		},
		concat: {
			dist: {
				src: [
					jsDir + 'lib/bootstrap.js',
					jsDir + 'sw-madame.js'
				],
				dest: jsDir + 'dist/<%= pkg.name %>.js'
			}
		},
		uglify: {
			target: {
				files:
					{
						'public/js/dist/<%= pkg.name %>.js' : 'public/js/dist/<%= pkg.name %>.min.js'
					}
			}
		},
		watch: {
			files: [
				jsDir + '*.js',
				styleDir + 'scss/*',
				'grunt.js',
				'app/*.js',
				'app/**/*.js',
				'app.js',
				'routes/**.js'
			],
			tasks: ['default']
		},
		compass: {
			dev: {
				src: styleDir + 'scss/',
				dest: styleDir,
				linecomments: true
			}
		}
	});

	// Default task.
	grunt.registerTask('default', ['linter', 'concat', 'uglify', 'compass:dev', 'cssmin']);

};
