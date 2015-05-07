#global module:false

"use strict"

module.exports = (grunt) ->
  grunt.loadNpmTasks "grunt-contrib-connect"
  grunt.loadNpmTasks "grunt-contrib-sass"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-contrib-jshint"
  grunt.loadNpmTasks "grunt-jscs"

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
          "build"
        ]

    jshint:
      all: [
        "lib/js/**/*"
      ]

    jscs:
      src: [
        "lib/js/**/*"
      ]
      options:
        config: '.jscsrc'
        verbose: true

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

  grunt.registerTask "build", [
    "sass"
    "jshint"
    "jscs"
  ]

  grunt.registerTask "default", [
    "build"
    "connect"
    "watch"
  ]
