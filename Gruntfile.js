module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      sub_task: {
        src: ['link.js', 'page.js', 'session.js', 'user.js'],
        dest: 'models/models_dest.js',
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  // grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  // grunt.registerTask('default', ['uglify']);

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('sub_task', ['concat:sub_task']);

};
