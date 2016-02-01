var gulp = require('gulp'),
    mocha = require('gulp-mocha');
    
/**
 *  Task that runs unit test using Mocha
 */
gulp.task('tests', function(){
   gulp.src('server.vorlon.tools.tests.js')
    .pipe(mocha()); 
});