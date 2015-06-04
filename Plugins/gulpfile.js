var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    typescript = require('gulp-typescript'),
    merge = require('merge2'),
    webserver = require('gulp-webserver'),
    less = require('gulp-less'),
    gulpFilter = require('gulp-filter');

/**
 * Compile typescript files to their js respective files
 */
gulp.task('typescript-to-js', function() {
  //Compile all ts file into their respective js file.
  
  var tsResult = gulp.src(['Vorlon/**/*.ts', 'libs/**.ts'])
                       .pipe(typescript({ 
                            declarationFiles: true,
                            noExternalResolve: true, target: 'ES5'}
                          ));
  
   return merge([
      tsResult.dts.pipe(gulp.dest('release')),
      tsResult.js.pipe(gulp.dest('release'))
      ]);
});

/**
 * Compile less files to their css respective files
 */
gulp.task('less-to-css', function() {
  return gulp.src(['Vorlon/**/*.less'], { base : '.' })
    .pipe(less())
    .pipe(gulp.dest(''));  
});

/**
 * Concat all js files in order into one big js file and minify it.
 * Do not hesitate to update it if you need to add your own files.
 */
gulp.task('scripts-noplugin', ['typescript-to-js'], function() {
    return gulp.src([
            'release/vorlon.tools.js',
            'release/vorlon.enums.js',
            'release/vorlon.plugin.js',
            'release/vorlon.clientMessenger.js',
            'release/vorlon.core.js'
        ])
        .pipe(concat('vorlon-noplugin.max.js'))
        .pipe(gulp.dest('release/'))
        .pipe(rename('vorlon-noplugin.js'))
        .pipe(uglify())
        .pipe(gulp.dest('release/'));

});

/**
 * Minify all plugins.
 * Do not hesitate to update it if you need to add your own files.
 */
gulp.task('scripts', ['typescript-to-js'], function () {
    return gulp.src([
            './**/vorlon.interactiveConsole.js',
            './**/vorlon.domExplorer.js',
            './**/vorlon.modernizrReport.js',
            './**/objectExplorer/vorlon.objectExplorer.js',
            './**/networkpanel/vorlon.networkpanel.js',
            './**/sample/vorlon.sample.js'
        ])
        .pipe(rename(function (path) {
                path.extname = ".min.js";
              })
            )
        .pipe(uglify())
        .pipe(gulp.dest('.'));
});

/**
 * Move all files from Plugins to Server
 */
gulp.task('copy', function () {

    gulp.src([
            'release/vorlon-noplugin.max.js',
            'release/vorlon-noplugin.js'
        ])
        .pipe(gulp.dest('../Server/public/vorlon'));

});

gulp.task('copyPlugins', function () {

    gulp.src([
          'Vorlon/plugins/**/*.js',
          'Vorlon/plugins/**/*.css',
          'Vorlon/plugins/**/*.html',
          'release/plugins/**/*.js'
    ])
        .pipe(gulp.dest('../Server/public/vorlon/plugins'));

});

gulp.task('copyDTS', function () {

    gulp.src(['Vorlon/**/*.d.ts']).pipe(gulp.dest('../Server/Scripts/typings/Vorlon'));

});

/**
 * The default task, call the tasks: scripts, scripts-noplugin, copy, copyPlugins
 */
gulp.task('default', ['scripts', 'scripts-noplugin', 'less-to-css'], function() {
    gulp.start('copy', 'copyPlugins', 'copyDTS');
});

/**
 * Watch task, will call the default task if a js file is updated.
 */
//gulp.task('watch', function() {
//  gulp.watch('src/**/*.js', ['default']);
//});

/**
 * Watch typescript task, will call the default typescript task if a typescript file is updated.
 */
gulp.task('watch', function() {
  gulp.watch([
    'Vorlon/**/*.ts',
    'Vorlon/**/*.less',
    //'Vorlon/plugins/**/*.*',
  ], ['default']);
});

/**
 * Web server task to serve a local test page
 */
gulp.task('webserver', function() {
  gulp.src('samples')
    .pipe(webserver({
      livereload: false,
      open: 'http://localhost:1338/index.html',
      port: 1338,
      fallback: 'index.html'
    }));
});
