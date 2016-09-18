module.exports = function (grunt) {
    //grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-babel');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            merchant: {
                options: {
                    paths: ['less'],
                    compress: false,
                    yuicompress: false,
                    optimization: 2
                },
                files: {
                    "css/style.css": "less/style.less"
                }
            }
        },
        babel: {
            options: {
                sourceMap: true,
                presets: ['babel-preset-es2015','babel-preset-react']
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'jsx/',
                        src: ['**/*.js'],
                        dest: 'js/',
                        ext: '.js'
                    }
                ]
            }
        },
        watch: {
            merchant: {
                files: 'less/**/*.less',
                tasks: ['less:merchant'],
                options: {
                    nospawn: true
                }
            },
            babel: {
                files: 'jsx/*.js',
                tasks: ['babel']
            }
        }
    });

    grunt.registerTask('default', ['watch']);
};
