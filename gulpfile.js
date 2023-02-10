const gulp = require('gulp');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const typescript = require('gulp-typescript');
const merge = require('merge2');
const webserver = require('gulp-webserver');
const less = require('gulp-less');
const gulputil = require('gulp-util');
const gulpFilter = require('gulp-filter');
const path = require('path');
const sourcemaps = require('gulp-sourcemaps');
const zip = require('gulp-zip');
const { series } = require('gulp');
const cp = require('child_process');
const log = require('fancy-log');

var paths = {
    out: "./output/"
}
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
                            noResolve: false, 
                            target: 'ES5'}
                          ));
  
   return merge([
      tsResult.dts.pipe(gulp.dest('Plugins/release')),
      tsResult.js.pipe(gulp.dest('Plugins/release'))
      ]);
});


 /* Compile less files to their css respective files
 */
gulp.task('less-to-css-plugins',  function() {
  return gulp.src(['Plugins/Vorlon/**/*.less'], { base : '.' })
    .pipe(less())
    .pipe(gulp.dest(paths.out+'less-to-css-plugins/'));  
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

    return  Promise.resolve(gulp.src(['Plugins/release/*.d.ts'])
      .pipe(gulp.dest('./Server/Scripts/typings/Vorlon')));
      
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
    'Plugins/Vorlon/**/*.html',
    'Vorlon/plugins/**/*.*'
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
                      .pipe(typescript({ noResolve: false, target: 'ES5', module: 'commonjs' }));

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

gulp.task('build-server', gulp.series('typescript-to-js-server', function() {
	//copy server files to desktop app
  return Promise.resolve(gulp.src([
  		'./server/**/*.*'
  	])
  	.pipe(gulp.dest(paths.out+'build-server/')));
}));

gulp.task('default-server', gulp.series('build-server'));

/**
 * Watch typescript task, will call the default typescript task if a typescript file is updated.
 */
gulp.task('watch-server', function() {
  gulp.watch([
    './Server/**/*.ts',
  ], ['default-server']);
});


gulp.task('watch', gulp.series("watch-server", "watch-plugins", "webserver"));

/**
 * Zip task used within the build to create an archive that will be deployed using VSTS Release Management
 */

gulp.task('zip', function() {
    gulp.src(['./**/*', '!./DeploymentTools/**', '!./desktop/**', '!./plugins library/**', '!./Plugins/**', '!./Tests/**', '!./desktop', '!./plugins library', '!./DeploymentTools', '!./Plugins', '!./Tests'])
        .pipe(zip('deployment-package.zip'))
        .pipe(gulp.dest('DeploymentTools'));
});

//--------------------

gulp.task('concat-webstandards-rules-plugins', gulp.series('typescript-to-js-plugins', function () {
	return Promise.resolve(gulp.src(['./Plugins/release/**/webstandards/rules/*.js', './Plugins/release/**/webstandards/vorlon.webstandards.client.js'])
		.pipe(concat('vorlon.webstandards.client.js'))
		.pipe(gulp.dest('Plugins/release/plugins/webstandards/')));
}));

/**
 * Minify all plugins.
 * Do not hesitate to update it if you need to add your own files.
 */
 gulp.task('scripts-plugins', gulp.series('concat-webstandards-rules-plugins', function () {

    return Promise.resolve(gulp.src([
            './Plugins/**/vorlon.*.js',
            '!./Plugins/**/vorlon.*.min.js'
        ])
        .pipe(rename(function (path) {
                path.extname = ".min.js";
              })
            )
        .pipe(uglify())
        .pipe(gulp.dest('./Plugins')));
}));

/**
 * Concat all js files in order into one big js file and minify it.
 * Do not hesitate to update it if you need to add your own files.
 */
 gulp.task('scripts-noplugin-plugins', gulp.series('typescript-to-js-plugins', function() {
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
}));

/**
 * Specific task that need to be handled for specific plugins.
 * Do not hesitate to update it if you need to add your own files
 */
 gulp.task('scripts-specific-plugins-plugins', gulp.series('scripts-plugins', function() {
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

}));

/**
 * The default task, call the tasks: scripts, scripts-noplugin, copy, copyPlugins
 */
 gulp.task('default-plugins', gulp.series('scripts-plugins', 'scripts-noplugin-plugins', 'less-to-css-plugins', 'scripts-specific-plugins-plugins', 
 'copy-plugins', 'copyPlugins-plugins', 'copyDTS-plugins'));

/// GLOBAL 
gulp.task('default-server-all', gulp.series('default-plugins', 'copyDTS-plugins', 'default-server'));

/**
 * Gets version of all the required binaries and stores them in .env-snap file
 */
gulp.task('get-env-snapshot', function(cb) {

    console.log("------ DATE ------");
    const date = new Date();
    const day = date.toDateString();
    const time = date.toLocaleTimeString();
    console.log(day + " " + time);
    console.log("------------------");
        
        version('node');
        version('npm');
        version('tsc');
        version('gulp');    
        cb();
});
  
function version(pkg) {
    return cp.exec(pkg + ' -v', function (err, stdout, stderr) {
        console.log(pkg + " -v");
        console.log(stdout);
        console.log(" ");
      });
  }
exports.default = series('default-server-all')
exports.ts = series('typescript-to-js-server')
exports.snap = series('get-env-snapshot')