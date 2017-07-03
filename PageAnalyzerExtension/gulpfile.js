var gulp = require("gulp");
var uglify = require("gulp-uglify");
var typescript = require("gulp-typescript");
var sourcemaps = require("gulp-sourcemaps");
var merge2 = require("merge2");
var concat = require("gulp-concat");
var rename = require("gulp-rename");
var cleants = require('gulp-clean-ts-extends');
var changed = require('gulp-changed');
var runSequence = require('run-sequence');
var replace = require("gulp-replace");
var zip = require('gulp-zip');

var config = require("./config.json");
var extension = require("./src/extensionconfig.json");

/*
Compiles all typescript files and creating a declaration file.
*/
gulp.task('typescript-compile', function() {  
  var tsResult = gulp.src(config.core.typescript)
                .pipe(typescript({ 
                    noExternalResolve: true, 
                    target: 'ES5', 
                    declarationFiles: true,
                    typescript: require('typescript')
                }));
    return merge2([
        tsResult.dts
            .pipe(concat(config.build.declarationFilename))
            .pipe(gulp.dest(config.build.outputDirectory)),
        tsResult.js
            .pipe(gulp.dest(config.build.outputDirectory))
    ]);
});

gulp.task("copySource", ['typescript-compile'], function () {
     return gulp.src(config.core.files)
     .pipe(gulp.dest(config.build.outputDirectory));
});

gulp.task("runtime", ['copySource'], function () {
    var pluginsFiles = [
        config.build.outputDirectory + "/vorlonCore/vorlon.tools.js",
        config.build.outputDirectory + "/vorlonCore/vorlon.enums.js",
        config.build.outputDirectory + "/vorlonCore/vorlon.clientMessenger.js",
        config.build.outputDirectory + "/vorlonCore/vorlon.core.js",
        config.build.outputDirectory + "/vorlonCore/vorlon.basePlugin.js",
        config.build.outputDirectory + "/vorlonCore/vorlon.clientPlugin.js"
    ];
    
    var pluginFile = config.build.outputDirectory + "/plugin/vorlon." + extension.name + ".client.js";
    
    if (extension.dependencies) {
        for (var dependenciesIndex = 0; dependenciesIndex < extension.dependencies.length; dependenciesIndex++) {
            pluginsFiles.push(config.build.outputDirectory + "/plugin/" + extension.dependencies[dependenciesIndex]);
        }
    }
    
    pluginsFiles.push(pluginFile);
     
    pluginsFiles.push(config.build.outputDirectory + "/vorlonCore/vorlon.core.client.js");
    
    return gulp.src(pluginsFiles)
    .pipe(concat(config.build.runtimeFilename))        
    .pipe(gulp.dest(config.build.outputDirectory));
});

gulp.task("copyFilesForfirefox", ['runtime'], function () {
     return gulp.src(config.build.outputDirectory + '/**/*.*')
     .pipe(gulp.dest(config.build.outputDirectoryForFirefox));
});

gulp.task("copyManifestForfirefox", ['copyFilesForfirefox'], function () {
     return gulp.src('src/firefoxManifest.json')
     .pipe(concat('manifest.json'))
     .pipe(gulp.dest(config.build.outputDirectoryForFirefox))
});

gulp.task("firefox", ['copyManifestForfirefox'], function () {
     return gulp.src(config.build.outputDirectoryForFirefox + '/**/*.*')
     .pipe(zip(config.build.firefoxFilename))
     .pipe(gulp.dest(config.build.distDirectory));
});

gulp.task("default", ['firefox'], function () {
     console.log("Process done...");
});

/**
 * Watch task, will call the default task if an important file is updated.
 */
gulp.task('watch', function() {
  gulp.watch(config.core.watch, ['default']);
});