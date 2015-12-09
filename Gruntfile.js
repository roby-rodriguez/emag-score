var _  = require('lodash');

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
        },
        generateNodeEnv: {
            development: {
                src: require('./app/config/local.env')
            },
            production: {
                src: require('./app/config/prod.env')
            },
            globalOptions: {
                src: require('./app/config/all.env'),
                dest: './app/config/generated/env.js'
            }
        }
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-ng-constant');

    grunt.registerTask('generateNodeEnv', function (target) {
        var configuration = grunt.config.data[this.name][target];
        var options = grunt.config.data[this.name].globalOptions;
        var merged = _.merge(options.src, configuration.src);
        grunt.log.write('Creating app env constants module at ' + options.dest + '...');
        grunt.file.write(options.dest, 'module.exports = ' + JSON.stringify(merged) + ';');
        grunt.log.ok();
    });

    // Default task(s).
    grunt.registerTask('build', function (target) {
        if (target === 'production') {
            grunt.task.run(['ngconstant:production', 'generateNodeEnv:production']);
        } else {
            grunt.task.run(['ngconstant:development', 'generateNodeEnv:development']);
        }
    });
};