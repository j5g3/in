module.exports = function(grunt) {

	grunt.initConfig({
		//pkg: grunt.file.readJSON('package.json'),

		clean: {
			j5g3in: [ 'build' ]
		},

		jshint: {
			'j5g3in': {
				options: { jshintrc: '.jshintrc' },
				src: [
					'src/j5g3-in.js', 'src/j5g3-in-mouse.js'
				]
			}
		},

		concat: {
			"j5g3in": {
				src: '<%= jshint.j5g3in.src %>',
				dest: 'build/j5g3-in-all.js'
			},

			"j5g3in-standalone": {
				src: [ 'lib/j5g3-core.js', '<%= jshint.j5g3in.src %>' ],
				dest: 'build/j5g3-in-standalone.js'
			}
		},

		uglify: {

			j5g3in: {
				compress: true,
				files: {
					'build/j5g3-in-all.min.js': 'build/j5g3-in-all.js'
				}
			},

			'j5g3in-standalone': {
				compress: true,
				files: {
					'build/j5g3-in-standalone.min.js': 'build/j5g3-in-standalone.js'
				}
			}

		},

		watch: {
			j5g3in: {
				files: '<%= jshint.j5g3in.src %>',
				tasks: [ 'jshint:j5g3in', 'clean:j5g3in', 'concat' ]
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('default', [ 'jshint', 'clean', 'concat' ]);
	grunt.registerTask('minify', [ 'default', 'uglify' ]);
};
