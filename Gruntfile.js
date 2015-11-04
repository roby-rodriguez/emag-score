module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        ngconstant: {
            options: {
                name: 'emagScoreConstant',
                wrap: '"use strict";\n\n{%= __ngModule %}',
                space: '  '
            },
            development: {
                options: {
                    dest: './public/js/config/constant.js'
                },
                constants: {
                    Environment: {
                        apiEndpoint: 'http://localhost:1337'
                    }
                }
            },
            production: {
                options: {
                    dest: './public/js/config/constant.js'
                },
                constants: {
                    Environment: {
                        apiEndpoint: 'https://emag-score-roby-rodriguez.c9.io'
                    }
                }
            }
        }
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-ng-constant');

    // Default task(s).
    grunt.registerTask('build', function (target) {
        if (target === 'production') {
            grunt.task.run(['ngconstant:production']);
        } else {
            grunt.task.run(['ngconstant:development']);
        }
    });
};