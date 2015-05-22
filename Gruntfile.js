module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    connect: {
      demo: {
        options:{
          port: 3001,
          base: '',
          keepalive: true
        }
      }
    },
    'smush-components': {
      options: {
        fileMap: {
          js: 'Server/public/javascripts/x-tag-components.js',
          css: 'Server/public/stylesheets/x-tag-components.css'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-smush-components');

  grunt.registerTask('build', ['smush-components']);

};