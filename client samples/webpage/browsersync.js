/**
 * Require Browsersync
 */
var browserSync = require('browser-sync').create();

/**
 * Run Browsersync with server config
 */
browserSync.init({
    server: "./",
    files: ["./**/*.html", "./**/*.css"]
});