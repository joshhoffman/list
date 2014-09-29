module.exports = function(grunt) {
    // load plugins
    [
        'grunt-contrib-watch',
        'grunt-contrib-jshint',
        'grunt-browserify',
        'grunt-contrib-copy',
        'grunt-contrib-clean',
        'grunt-contrib-uglify'
    ].forEach(function(task) {
            grunt.loadNpmTasks(task);
        });

    var vendors = 'jquery backbone backbone.marionette'.split(' ');

    var jsFiles = ['app/**/*.js', 'app.js'];

    var mariApp = ['app/app.js'];

    var coffeeScriptCompile = {
        'frontEnd.js': 'frontEnd.coffee',
        'privateAPI.js': 'privateAPI.coffee',
        'publicAPI.js' : 'publicAPI.coffee',
        'configure/controller.js': 'configure/controller.coffee',
        'configure/secureController.js': 'configure/secureController.coffee',
        'configure/config.js': 'configure/config.coffee',
        'configure/configMiddleware.js': 'configure/configMiddleware.coffee',
        'configure/ensureLogin.js': 'configure/ensureLogin.coffee',
        'configure/configPassport.js': 'configure/configPassport.coffee',
        'configure/utils/utils.js': 'configure/utils/utils.coffee',
        'APIRoutes/apiRoutes.js': 'APIRoutes/apiRoutes.coffee',
        'APIRoutes/middlewareRoutes.js': 'APIRoutes/middlewareRoutes.coffee',
        'APIControllers/linkController.js': 'APIControllers/linkController.coffee',
        'APIControllers/linksController.js': 'APIControllers/linksController.coffee',
        'APIControllers/loginController.js': 'APIControllers/loginController.coffee',
        'APIControllers/registerController.js': 'APIControllers/registerController.coffee',
        'APIControllers/logoutController.js': 'APIControllers/logoutController.coffee',
        'APIControllers/userController.js': 'APIControllers/userController.coffee',
        'APIControllers/usersController.js': 'APIControllers/usersController.coffee',
        'models/link.js': 'models/link.coffee',
        'models/links.js': 'models/links.coffee',
        'models/user.js': 'models/user.coffee'
    };

    var coffeeScriptFiles = [
        '*.coffee',
        'configure/*.coffee',
        'APIRoutes/*.coffee',
        'APIControllers/*.coffee'
    ];

    grunt.initConfig({
        clean: {
            js: [
                'APIControllers/*.js',
                'APIRoutes/*.js',
                'configure/*.js',
                '!configure/settings.js',
                'models/*.js',
                'privateAPI.js',
                'publicAPI.js',
                'frontEnd.js',
                '**/*.map',
                'deploy/**'
            ]
        },
        uglify: {
            prod: {
                files: {
                    'public/static/bundle.js': ['public/static/bundle.js']
                }
            }
        },
        copy: {
            release: {
                files: [
                    {expand: true, src:[
                        'frontEnd.js',
                        'webAPI.js',
                        'Gruntfile.js',
                        'nodemon.json',
                        'package.json'
                    ], dest: 'deploy/release'},
                    {expand: true, src:['public/**'], dest: 'deploy/release'},
                    {expand: true, src:['APIControllers/*.js'], dest: 'deploy/release'},
                    {expand: true, src:['configure/*.js'], dest: 'deploy/release'},
                    {expand: true, src:['APIRoutes/*.js'], dest: 'deploy/release'},
                    {expand: true, src:['models/*.js'], dest: 'deploy/release'}
                ]
            }
        },
        jshint: {
            files: jsFiles
        },
        browserify: {
            options: {
                debug: true,
                extensions: ['.coffee', '.hbs'],
                transform: ['coffeeify', 'hbsfy'],
                shim: {
                    jquery: {
                        path: 'node_modules/jquery/src/jquery.js',
                        exports: '$'
                    }
                }
            },
            dev: {
                src: mariApp,
                dest: 'public/static/bundle.js'
            },
            prod: {
                options: {
                    debug: false
                },
                src: mariApp,
                dest: 'public/static/bundle.js'
            }
        },
        coffee: {
            options: {
                sourceMap: false
            },
            compile: {
                files: coffeeScriptCompile
            }
        },
        coffeelint: {
            options: {
                configFile: 'coffeelint.json'
            },
            app: coffeeScriptFiles
        },
        watch: {
            browserify: {
                files: [
                    'app/**/*.js',
                    'app/**/*.hbs'
                ],
                tasks: [
                    'browserify:dev'
                ]
            },
            jshint: {
                files: [
                    'public/qa/**/*.js',
                    'public/js/**/*.js',
                    'app/**/*.js'
                ],
                tasks: [
                    'jshint'
                ]
            },
            testhint: {
                files: [
                    'qa/**/*.js'
                ],
                tasks: [
                    'jshint:tests'
                ]
            },

            mocha: {
                files: [
                    'app.js',
                    'webAPI.js',
                    'middlewareUsageCheck.js',
                    'APIControllers/**/*.js',
                    'APIRoutes/**/*.js',
                    'configure/*.js',
                    'models/*.js',
                    'qa/**/*.js'
                ],
                tasks: [
                    'cafemocha'
                ]
            },
            lessCompile: {
                files: [
                    'static/*.less'
                ],
                tasks: [
                    'less'
                ]
            }
        }
    });

    //grunt.registerTask('compile', ['coffee', 'browserify:dev', 'cafemocha'])
    grunt.registerTask('compile', ['browserify:dev'])
    grunt.registerTask('compileProd', ['browserify:prod', 'uglify', 'cafemocha'])
    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('default', ['lint', 'compile']);

    grunt.registerTask('release', ['clean', 'lint', 'compileProd', 'copy']);

    grunt.registerTask('runFrontEnd', function() {
        grunt.util.spawn({
                cmd: 'nodemon',
                args: ['frontEnd.js'],
                opts: {
                    stdio: 'inherit'
                }
            }, function() {
                grunt.fail.fatal(new Error('nodemon quit'));
            }
        )
    });

    grunt.registerTask('server', ['clean', 'lint', 'compile', 'runFrontEnd', 'watch']);
}
