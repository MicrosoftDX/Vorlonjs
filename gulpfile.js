var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    typescript = require('gulp-typescript'),
    merge = require('merge2'),
    webserver = require('gulp-webserver'),
    less = require('gulp-less'),
    gulputil = require('gulp-util'),
    gulpFilter = require('gulp-filter'),
    path = require('path'),
    sourcemaps = require('gulp-sourcemaps'),
    zip = require('gulp-zip');

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
	return gulp.src(['./Plugins/release/**/webstandards/rules/*.js', './Plugins/release/**/webstandards/vorlon.webstandards.client.js'])
		.pipe(concat('vorlon.webstandards.client.js'))
		.pipe(gulp.dest('Plugins/release/plugins/webstandards/'));
});

/**
 * Specific task that need to be handled for specific plugins.
 * Do not hesitate to update it if you need to add your own files
 */
gulp.task('scripts-specific-plugins-plugins', ['scripts-plugins'], function() {
    // DOMTimeline
    gulp.src([
        'Plugins/Vorlon/plugins/domtimeline/mapping-system.js',
        'Plugins/release/plugins/domtimeline/vorlon.domtimeline.dashboard.js',
    ])
        .pipe(concat('vorlon.domtimeline.dashboard.min.js'))
        .pipe(gulp.dest('Plugins/release/plugins/domtimeline/'));
	gulp.src([
		'Plugins/Vorlon/plugins/domtimeline/dom-timeline.js',
        'Plugins/Vorlon/plugins/domtimeline/mapping-system.js',
        'Plugins/release/plugins/domtimeline/vorlon.domtimeline.client.js',
    ])
        .pipe(concat('vorlon.domtimeline.client.js'))
        .pipe(gulp.dest('Plugins/release/plugins/domtimeline/'));

		
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

    // Bot framework inspector
    gulp.src([
        'Plugins/release/plugins/botFrameworkInspector/vorlon.botFrameworkInspector.interfaces.js',
        'Plugins/release/plugins/botFrameworkInspector/vorlon.botFrameworkInspector.client.js'
    ])
        .pipe(concat('vorlon.botFrameworkInspector.client.js'))
        .pipe(gulp.dest('Plugins/release/plugins/botFrameworkInspector/'));

    gulp.src([
        'Plugins/release/plugins/botFrameworkInspector/vorlon.botFrameworkInspector.interfaces.js',
        'Plugins/release/plugins/botFrameworkInspector/vorlon.botFrameworkInspector.dashboard.js'
    ])
        .pipe(concat('vorlon.botFrameworkInspector.dashboard.js'))
        .pipe(gulp.dest('Plugins/release/plugins/botFrameworkInspector/'));
        
    gulp.src([
        'Plugins/release/plugins/botFrameworkInspector/vorlon.botFrameworkInspector.interfaces.min.js',
        'Plugins/release/plugins/botFrameworkInspector/vorlon.botFrameworkInspector.client.min.js'
    ])
        .pipe(concat('vorlon.botFrameworkInspector.client.min.js'))
        .pipe(gulp.dest('Plugins/release/plugins/botFrameworkInspector/'));

    gulp.src([
        'Plugins/release/plugins/botFrameworkInspector/vorlon.botFrameworkInspector.interfaces.min.js',
        'Plugins/release/plugins/botFrameworkInspector/vorlon.botFrameworkInspector.dashboard.min.js'
    ])
        .pipe(concat('vorlon.botFrameworkInspector.dashboard.min.js'))
        .pipe(gulp.dest('Plugins/release/plugins/botFrameworkInspector/'));
        
    // Office
    gulp.src([
        'Plugins/release/plugins/office/vorlon.office.interfaces.js',
        'Plugins/release/plugins/office/vorlon.office.tools.js',
        'Plugins/release/plugins/office/vorlon.office.document.js',
        'Plugins/release/plugins/office/vorlon.office.outlook.js',
        'Plugins/release/plugins/office/vorlon.office.powerpoint.js',
        'Plugins/release/plugins/office/vorlon.office.dashboard.js'
    ])
        .pipe(concat('vorlon.office.dashboard.js'))
        .pipe(gulp.dest('Plugins/release/plugins/office/'));

     gulp.src([
        'Plugins/release/plugins/office/vorlon.office.interfaces.min.js',
        'Plugins/release/plugins/office/vorlon.office.tools.min.js',
        'Plugins/release/plugins/office/vorlon.office.document.min.js',
        'Plugins/release/plugins/office/vorlon.office.outlook.min.js',
        'Plugins/release/plugins/office/vorlon.office.powerpoint.min.js',
        'Plugins/release/plugins/office/vorlon.office.dashboard.min.js'
    ])
        .pipe(concat('vorlon.office.dashboard.min.js'))
        .pipe(gulp.dest('Plugins/release/plugins/office/'));     
           
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
            './Plugins/**/vorlon.*.js',
            '!./Plugins/**/vorlon.*.min.js'
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
          'Plugins/Vorlon/plugins/**/*.PNG',          
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
  return gulp.src('client samples/webpage')
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
                     // .pipe(sourcemaps.init())
                      .pipe(typescript({ noExternalResolve: true, target: 'ES5', module: 'commonjs' }));

  return tsResult.js
            .pipe(sourcemaps.write({
              includeContent: false,
              // Return relative source map root directories per file.
              sourceRoot: function (file) {
                // var sourceFile = path.join(file.cwd, file.sourceMap.file);
                // return path.relative(path.dirname(sourceFile), file.cwd);
              }
            }))
            .pipe(gulp.dest('.'));
});

gulp.task('build-server', ['typescript-to-js-server'], function() {
	//copy server files to desktop app
  return gulp.src([
  		'./server/**/*.*'
  	])
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


gulp.task('watch', ["watch-server", "watch-plugins", "webserver"], function() {
});

/**
 * Zip task used within the build to create an archive that will be deployed using VSTS Release Management
 */

gulp.task('zip', function() {
    gulp.src(['./**/*', '!./DeploymentTools/**', '!./desktop/**', '!./plugins library/**', '!./Plugins/**', '!./Tests/**', '!./desktop', '!./plugins library', '!./DeploymentTools', '!./Plugins', '!./Tests'])
        .pipe(zip('deployment-package.zip'))
        .pipe(gulp.dest('DeploymentTools'));
});