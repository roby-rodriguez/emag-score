module.exports = function (grunt) {

    //TODO put watches on the sources for generated files

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
                    dest: './public/js/config/generated/constant.js'
                },
                constants: function () {
                    return {
                        Environment: require('./public/js/config/local.env')
                    }
                }
            },
            production: {
                options: {
                    dest: './public/js/config/generated/constant.js'
                },
                constants: function () {
                    return {
                        Environment: require('./public/js/config/prod.env')
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