/*global module:false*/
module.exports = function (grunt) {
	"use strict";
	grunt.loadNpmTasks('grunt-linter');
	grunt.loadNpmTasks('grunt-contrib-compass');
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
				'strict': true,
				'curly': true,
				'eqeqeq': true,
				'forin': true,
				'immed': true,
				'plusplus': true,
				'maxdepth': 6,
				'trailing': true,
//				'quotmark': true, // 'single' or 'double'
//				'undef': true,
//				'unused': true,
				'node': true
			},
			globals: {
				'jQuery': true
			}
		},
		cssmin: {
			combine: {
				'files': {
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
					jsDir + 'sw-madame.js'
				],
				dest: jsDir + 'dist/<%= pkg.name %>.js'
			}
		},
		uglify: {
			target: {
				files:
					{
						'public/js/dist/Madame.min.js' : 'public/js/dist/Madame.js'
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
				options: {
					sassDir: styleDir + 'scss',
					cssDir: styleDir
				}
			}
		}
	});

	// Default task.
	grunt.registerTask('default', ['linter', 'concat', 'uglify', 'compass:dev', 'cssmin']);

};
