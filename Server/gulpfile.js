var gulp = require('gulp'),
    typescript = require('gulp-typescript');

gulp.task('typescript-to-js', function() {
  var tsResult = gulp.src(['./**/*.ts', '!./node_modules', '!./node_modules/**'], { base: './' })
                      .pipe(typescript({ noExternalResolve: true, target: 'ES5', module: 'commonjs' }));

  return tsResult.js
            .pipe(gulp.dest('.'));
});

gulp.task('build', ['typescript-to-js'], function() {
  return gulp.src([
  		'./config.json',
  		'cert/**',
  		'config/**',
  		'public/**',
  		'Scripts/**',
  		'views/**',
  	], { base: './' })
  	.pipe(gulp.dest('../desktop/app/vorlon'));
});

gulp.task('default', function() {
  gulp.start('build');
});

/**
 * Watch typescript task, will call the default typescript task if a typescript file is updated.
 */
gulp.task('watch', function() {
  gulp.watch([
    './**/*.ts',
  ], ['default']);
});