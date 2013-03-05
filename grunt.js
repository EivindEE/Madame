/*global module:false*/
module.exports = function (grunt) {
	"use strict";
	grunt.loadNpmTasks('grunt-jslint');
	grunt.loadNpmTasks('grunt-contrib');
	grunt.loadNpmTasks('grunt-compass');
	var jsDir = 'public/js/',
		styleDir = 'public/stylesheets/';

	// Project configuration.
	grunt.initConfig({
		pkg: '<json:package.json>',
		meta: {
			banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
				' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
		},
		jslint: {
			files: [
				'grunt.js',
				jsDir + 'spec/**/*.js',
				jsDir + '*.js',
				'test/**/*.js', 'app/*.js',
				'app/**/*.js',
				'app.js',
				'routes/**.js'
			]
		},
		mincss: {
			compress: {
				files: {
					'public/stylesheets/style.min.css': [
						styleDir + 'reset.css',
						styleDir + 'bootstrap.css',
						styleDir + 'style.css'
					]
				}
			}
		},
		concat: {
			dist: {
				src: [
					jsDir + 'lib/bootstrap.js',
					jsDir + 'semtag.js',
					jsDir + 'sw-semtag.js',
					jsDir + 'proxy.js'
				],
				dest: jsDir + 'dist/<%= pkg.name %>.js'
			}
		},
		min: {
			dist: {
				src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
				dest: jsDir + 'dist/<%= pkg.name %>.min.js'
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
		jslint_directives: { // example directives
			browser: true,
			unparam: true,
			node: true,
			predef: [ // array of pre-defined globals
				'jQuery', 'require', 'process', '__dirname', 'console', 'exports'
			]
		},
		jslint_options: {
			errorsOnly: true // only display errors
		},
		uglify: {},
		compass: {
			dev: {
				src: styleDir + 'scss/',
				dest: styleDir,
				linecomments: true
			}
		}
	});

	// Default task.
	grunt.registerTask('default', 'jslint concat min compass:dev mincss');

};
