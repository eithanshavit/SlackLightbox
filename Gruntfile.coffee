#global module:false

"use strict"

module.exports = (grunt) ->
  grunt.loadNpmTasks "grunt-contrib-connect"
  grunt.loadNpmTasks "grunt-contrib-sass"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-contrib-jshint"

  grunt.initConfig

    connect:
      server:
        options:
          port: 4000
          livereload: true

    watch:
      options:
        livereload: true
      source:
        files: [
          "lib/sass/**/*"
          "lib/js/**/*"
        ]
        tasks: [
          "sass"
        ]

    jshint:
      all: [
        "lib/js/**/*"
      ]

    sass:
      compile:
        options:
          style: 'expanded'
        files: [
          expand: true
          cwd: 'lib/sass'
          src: ['**/*.scss']
          dest: 'lib/css'
          ext: '.css'
        ]

  grunt.registerTask "default", [
    "sass"
    "connect"
    "watch"
  ]
