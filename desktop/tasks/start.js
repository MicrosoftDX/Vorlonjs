'use strict';

var Q = require('q');
var electron = require('electron-prebuilt');
var pathUtil = require('path');
var childProcess = require('child_process');
var kill = require('tree-kill');
var utils = require('./utils');
var watch;

var gulpPath = pathUtil.resolve('./node_modules/.bin/gulp');
if (process.platform === 'win32') {
    gulpPath += '.cmd';
}

var runBuild = function () {
    var deferred = Q.defer();

    var build = childProcess.spawn(gulpPath, [
        'build',
        '--env=' + utils.getEnvName(),
        '--color'
    ], {
        stdio: 'inherit'
    });

    build.on('close', function (code) {
        deferred.resolve();
    });

    return deferred.promise;
};


var runDevBuild = function () {
    var deferred = Q.defer();

    var build = childProcess.spawn(gulpPath, [
        'devbuild',
        '--env=' + utils.getEnvName(),
        '--color'
    ], {
        stdio: 'inherit'
    });

    build.on('close', function (code) {
        deferred.resolve();
    });

    return deferred.promise;
};

var runGulpWatch = function () {
    watch = childProcess.spawn(gulpPath, [
        'watch',
        '--env=' + utils.getEnvName(),
        '--color'
    ], {
        stdio: 'inherit'
    });

    watch.on('close', function (code) {
        // Gulp watch exits when error occured during build.
        // Just respawn it then.
        runGulpWatch();
    });
};

var runDevWatch = function () {
    watch = childProcess.spawn(gulpPath, [
        'dev-watch',
        '--env=' + utils.getEnvName(),
        '--color'
    ], {
        stdio: 'inherit'
    });

    watch.on('close', function (code) {
        // Gulp watch exits when error occured during build.
        // Just respawn it then.
        runDevWatch();
    });
};

var runApp = function () {
    var app = childProcess.spawn(electron, ['./app'], {
        stdio: 'inherit'
    });

    app.on('close', function (code) {
        console.log("EXITED WITH CODE " + code);
        if (watch){
            // User closed the app. Kill the host process.
            kill(watch.pid, 'SIGKILL', function () {
                process.exit();
            });
        }else{
            process.exit();
        }
    });
};

runDevBuild()
.then(function () {
    runDevWatch();
    runApp();
});

