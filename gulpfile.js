var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    typescript = require('gulp-typescript'),
    merge = require('merge2'),
    webserver = require('gulp-webserver'),
    less = require('gulp-less'),
    gulputil = require('gulp-util'),
    gulpFilter = require('gulp-filter');

/// ********

/// GLOBAL 

gulp.task('default', function(){
  return gulp.start('default-server-all');
});

gulp.task('default-server-all', ['default-plugins', 'copyDTS-plugins'], function(){
  return gulp.start('default-server');
});


//// *****

//**** 

// PLUGIN PART

// *** 

/**
 * Compile typescript files to their js respective files
 */
gulp.task('typescript-to-js-plugins', function() {
  //Compile all ts file into their respective js file.
  
  var tsResult = gulp.src(['Plugins/Vorlon/**/*.ts', 'Plugins/libs/**.ts'])
                       .pipe(typescript({ 
                            declarationFiles: true,
                            noExternalResolve: true, target: 'ES5'}
                          ));
  
   return merge([
      tsResult.dts.pipe(gulp.dest('Plugins/release')),
      tsResult.js.pipe(gulp.dest('Plugins/release'))
      ]);
});


 /* Compile less files to their css respective files
 */
gulp.task('less-to-css-plugins', function() {
  return gulp.src(['Plugins/Vorlon/**/*.less'], { base : '.' })
    .pipe(less())
    .pipe(gulp.dest(''));  
});

/**
 * Concat all js files in order into one big js file and minify it.
 * Do not hesitate to update it if you need to add your own files.
 */
gulp.task('scripts-noplugin-plugins', ['typescript-to-js-plugins'], function() {
    return gulp.src([
            'Plugins/libs/css.js',
            'Plugins/release/vorlon.tools.js',
            'Plugins/release/vorlon.enums.js',
            'Plugins/release/vorlon.basePlugin.js',
            'Plugins/release/vorlon.clientPlugin.js',
            'Plugins/release/vorlon.dashboardPlugin.js',
            'Plugins/release/vorlon.clientMessenger.js',
            'Plugins/release/vorlon.core.js'
        ])
        .pipe(concat('vorlon-noplugin.max.js'))
        .pipe(gulp.dest('Plugins/release/'))
        .pipe(rename('vorlon-noplugin.js'))
        .pipe(uglify())
        .pipe(gulp.dest('Plugins/release/'));
});

gulp.task('concat-webstandards-rules-plugins', ['typescript-to-js-plugins'], function () {
	return gulp.src(['./Plugins/release/**/webstandards/rules/*.js', './Plugins/release/**/webstandards/client.js'])
		.pipe(concat('vorlon.webstandards.client.js'))
		.pipe(gulp.dest('Plugins/release/plugins/webstandards/'));
});

/**
 * Specific task that need to be handled for specific plugins.
 * Do not hesitate to update it if you need to add your own files
 */
gulp.task('scripts-specific-plugins-plugins', ['scripts-plugins'], function() {
    // Babylon Inspector
    gulp.src([
        'Plugins/release/plugins/babylonInspector/vorlon.babylonInspector.interfaces.js',
        'Plugins/release/plugins/babylonInspector/vorlon.babylonInspector.client.js'
    ])
        .pipe(concat('vorlon.babylonInspector.client.js'))
        .pipe(gulp.dest('Plugins/release/plugins/babylonInspector/'));

    gulp.src([
        'Plugins/release/plugins/babylonInspector/vorlon.babylonInspector.interfaces.js',
        'Plugins/release/plugins/babylonInspector/vorlon.babylonInspector.dashboard.js'
    ])
        .pipe(concat('vorlon.babylonInspector.dashboard.js'))
        .pipe(gulp.dest('Plugins/release/plugins/babylonInspector/'));
        
    gulp.src([
        'Plugins/release/plugins/babylonInspector/vorlon.babylonInspector.interfaces.min.js',
        'Plugins/release/plugins/babylonInspector/vorlon.babylonInspector.client.min.js'
    ])
        .pipe(concat('vorlon.babylonInspector.client.min.js'))
        .pipe(gulp.dest('Plugins/release/plugins/babylonInspector/'));

    gulp.src([
        'Plugins/release/plugins/babylonInspector/vorlon.babylonInspector.interfaces.min.js',
        'Plugins/release/plugins/babylonInspector/vorlon.babylonInspector.dashboard.min.js'
    ])
        .pipe(concat('vorlon.babylonInspector.dashboard.min.js'))
        .pipe(gulp.dest('Plugins/release/plugins/babylonInspector/'));
        
    // NG Inspector
    gulp.src([
        'Plugins/release/plugins/ngInspector/vorlon.ngInspector.interfaces.js',
        'Plugins/release/plugins/ngInspector/vorlon.ngInspector.client.js'
    ])
        .pipe(concat('vorlon.ngInspector.client.js'))
        .pipe(gulp.dest('Plugins/release/plugins/ngInspector/'));

    gulp.src([
        'Plugins/release/plugins/ngInspector/vorlon.ngInspector.interfaces.js',
        'Plugins/release/plugins/ngInspector/vorlon.ngInspector.dashboard.js'
    ])
        .pipe(concat('vorlon.ngInspector.dashboard.js'))
        .pipe(gulp.dest('Plugins/release/plugins/ngInspector/'));
        
    gulp.src([
        'Plugins/release/plugins/ngInspector/vorlon.ngInspector.interfaces.min.js',
        'Plugins/release/plugins/ngInspector/vorlon.ngInspector.client.min.js'
    ])
        .pipe(concat('vorlon.ngInspector.client.min.js'))
        .pipe(gulp.dest('Plugins/release/plugins/ngInspector/'));

    return gulp.src([
        'Plugins/release/plugins/ngInspector/vorlon.ngInspector.interfaces.min.js',
        'Plugins/release/plugins/ngInspector/vorlon.ngInspector.dashboard.min.js'
    ])
        .pipe(concat('vorlon.ngInspector.dashboard.min.js'))
        .pipe(gulp.dest('Plugins/release/plugins/ngInspector/'));

});

/**
 * Minify all plugins.
 * Do not hesitate to update it if you need to add your own files.
 */
gulp.task('scripts-plugins', ['concat-webstandards-rules-plugins'], function () {

    return gulp.src([
            './Plugins/**/vorlon.interactiveConsole.interfaces.js',
            './Plugins/**/vorlon.interactiveConsole.client.js',
            './Plugins/**/vorlon.interactiveConsole.dashboard.js',
            './Plugins/**/vorlon.domExplorer.interfaces.js',
            './Plugins/**/vorlon.domExplorer.client.js',
            './Plugins/**/vorlon.domExplorer.dashboard.js',
            './Plugins/**/vorlon.modernizrReport.interfaces.js',
            './Plugins/**/vorlon.modernizrReport.client.js',
            './Plugins/**/vorlon.modernizrReport.dashboard.js',
            './Plugins/**/objectExplorer/vorlon.objectExplorer.interfaces.js',
            './Plugins/**/objectExplorer/vorlon.objectExplorer.client.js',
            './Plugins/**/objectExplorer/vorlon.objectExplorer.dashboard.js',
            './Plugins/**/xhrPanel/vorlon.xhrPanel.interfaces.js',
            './Plugins/**/xhrPanel/vorlon.xhrPanel.client.js',
            './Plugins/**/xhrPanel/vorlon.xhrPanel.dashboard.js',
            './Plugins/**/vorlon.ngInspector.interfaces.js',
            './Plugins/**/vorlon.ngInspector.client.js',
            './Plugins/**/vorlon.ngInspector.dashboard.js',
            './Plugins/**/networkMonitor/vorlon.networkMonitor.interfaces.js',
            './Plugins/**/networkMonitor/vorlon.networkMonitor.client.js',
            './Plugins/**/networkMonitor/vorlon.networkMonitor.dashboard.js',
            './Plugins/**/resourcesExplorer/vorlon.resourcesExplorer.interfaces.js',
            './Plugins/**/resourcesExplorer/vorlon.resourcesExplorer.client.js',
            './Plugins/**/resourcesExplorer/vorlon.resourcesExplorer.dashboard.js',
            './Plugins/**/unitTestRunner/vorlon.unitTestRunner.interfaces.js',
            './Plugins/**/unitTestRunner/vorlon.unitTestRunner.client.js',
            './Plugins/**/unitTestRunner/vorlon.unitTestRunner.dashboard.js',
            './Plugins/**/sample/vorlon.sample.client.js',
            './Plugins/**/sample/vorlon.sample.dashboard.js',
            './Plugins/**/device/vorlon.device.interfaces.js',
            './Plugins/**/device/vorlon.device.client.js',
            './Plugins/**/device/vorlon.device.dashboard.js',
            './Plugins/**/webstandards/vorlon.webstandards.client.js',
            './Plugins/**/webstandards/vorlon.webstandards.interfaces.js',
            './Plugins/**/webstandards/vorlon.webstandards.dashboard.js',
            './Plugins/**/babylonInspector/vorlon.babylonInspector.client.js',
            './Plugins/**/babylonInspector/vorlon.babylonInspector.interfaces.js',
            './Plugins/**/babylonInspector/vorlon.babylonInspector.dashboard.js'
        ])
        .pipe(rename(function (path) {
                path.extname = ".min.js";
              })
            )
        .pipe(uglify())
        .pipe(gulp.dest('./Plugins'));
});

/**
 * Move all files from Plugins to Server
 */
gulp.task('copy-plugins', function () {

    return gulp.src([
            'Plugins/release/vorlon-noplugin.max.js',
            'Plugins/release/vorlon-noplugin.js'
        ])
        .pipe(gulp.dest('./Server/public/vorlon'));

});

gulp.task('copyPlugins-plugins', function () {

   return  gulp.src([
          'Plugins/Vorlon/plugins/**/*.js',
          'Plugins/Vorlon/plugins/**/*.css',
          'Plugins/Vorlon/plugins/**/*.html',
          'Plugins/Vorlon/plugins/**/*.png',
          'Plugins/release/plugins/**/*.js'
    ])
        .pipe(gulp.dest('./Server/public/vorlon/plugins'));

});

gulp.task('copyDTS-plugins', function () {

    return  gulp.src(['Plugins/release/*.d.ts'])
      .pipe(gulp.dest('./Server/Scripts/typings/Vorlon'));
      
});

/**
 * The default task, call the tasks: scripts, scripts-noplugin, copy, copyPlugins
 */
gulp.task('default-plugins', ['scripts-plugins', 'scripts-noplugin-plugins', 'less-to-css-plugins', 'scripts-specific-plugins-plugins'], function() {
    return gulp.start('copy-plugins', 'copyPlugins-plugins', 'copyDTS-plugins');
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
gulp.task('watch-plugins', function() {
  return gulp.watch([
    'Plugins/Vorlon/**/*.ts',
    'Plugins/Vorlon/**/*.less',
    'Plugins/Vorlon/**/*.html'
    //'Vorlon/plugins/**/*.*',
  ], ['default-plugins']);
});

/**
 * Web server task to serve a local test page
 */
gulp.task('webserver', function() {
  return gulp.src('Plugins/samples')
    .pipe(webserver({
      livereload: false,
      open: 'http://localhost:1338/index.html',
      port: 1338,
      fallback: 'index.html'
    }));
});

//**** 

// SERVER PART

// *** 

gulp.task('typescript-to-js-server', function() {
  var tsResult = gulp.src(['./Server/**/*.ts', '!./Server/node_modules', '!./Server/node_modules/**'], { base: './' })
                      .pipe(typescript({ noExternalResolve: true, target: 'ES5', module: 'commonjs' }));

  return tsResult.js
            .pipe(gulp.dest('.'));
});

gulp.task('build-server', ['typescript-to-js-server'], function() {
	//copy server files to desktop app
  return gulp.src([
  		'./config.json',
  		'cert/**',
  		'config/**',
  		'public/**',
  		'Scripts/**',
  		'views/**',
  	], { base: './Plugins' })
  	.pipe(gulp.dest('./desktop/app/vorlon'));
});

gulp.task('default-server', ['build-server'], function() {
});

/**
 * Watch typescript task, will call the default typescript task if a typescript file is updated.
 */
gulp.task('watch-server', function() {
  gulp.watch([
    './Server/**/*.ts',
  ], ['default-server']);
});


gulp.task('watch', function() {
  gulp.run("watch-server");
  gulp.run("watch-plugins");
  gulp.run("webserver");
});