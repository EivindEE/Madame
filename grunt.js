/*global module:false*/
module.exports = function (grunt) {
	"use strict";
	grunt.loadNpmTasks('grunt-jslint');
	grunt.loadNpmTasks('grunt-contrib');
	grunt.loadNpmTasks('grunt-compass');

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
				'public/javascripts/spec/**/*.js',
				'public/javascripts/*.js',
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
						'public/stylesheets/reset.css',
						'public/stylesheets/bootstrap.css',
						'public/stylesheets/style.css'
					]
				}
			}
		},
		concat: {
			dist: {
				src: [
					'public/javascripts/lib/bootstrap.js',
					'public/javascripts/semtag.js',
					'public/javascripts/sw-semtag.js',
					'public/javascripts/proxy.js'
				],
				dest: 'public/javascripts/dist/<%= pkg.name %>.js'
			}
		},
		min: {
			dist: {
				src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
				dest: 'public/javascripts/dist/<%= pkg.name %>.min.js'
			}
		},
		watch: {
			files: [
				'public/javascripts/*.js',
				'public/stylesheets/scss/*',
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
				src: 'public/stylesheets/scss/',
				dest: 'public/stylesheets/',
				linecomments: true
			}
		}
	});

	// Default task.
	grunt.registerTask('default', 'jslint concat min compass:dev mincss');

};
