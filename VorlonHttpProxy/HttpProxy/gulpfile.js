var gulp = require('gulp'),
    less = require('gulp-less'),
    typescript = require('gulp-typescript');

gulp.task('typescript-to-js', function() {
  var tsResult = gulp.src(['./**/*.ts', '!./node_modules', '!./node_modules/**'], { base: './' })
                      .pipe(typescript({ 
                        noExternalResolve: true, 
                        target: 'ES5', 
                        module: 'commonjs' 
                        }));

  return tsResult.js
            .pipe(gulp.dest('.'));
});

gulp.task('less-to-css', function() {
  return gulp.src(['./**/*.less'], { base : '.' })
    .pipe(less())
    .pipe(gulp.dest(''));  
});

gulp.task('default', function() {
  gulp.start('typescript-to-js');
  gulp.start('less-to-css');
});

/**
 * Watch typescript task, will call the default typescript task if a typescript file is updated.
 */
gulp.task('watch', function() {
  gulp.watch([
    './**/*.ts',
    './**/*.less',
  ], ['default']);
});