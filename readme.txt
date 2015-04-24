**** Vorlon.JS ****

Tools to install in Visual Studio 2015 
- NodeJS Tools for VS 2015 : https://nodejstools.codeplex.com/releases/view/612156

NodeJS plugins :
- nodeJS : https://nodejs.org/
- npm install -g express

====================
Build Vorlon.js with Gulp
====================

Build Vorlon.js with [gulp](http://gulpjs.com/ "gulp") and npm ([nodejs](http://nodejs.org/ "nodejs")), easy and cross-platform

(Paths in this file are relative to this file location.)

# How to use it

### open a command prompt in the Plugins folder

### First install gulp :
```
npm install -g gulp
```

### Install some dependencies :
```
npm install gulp
```

### Update dependencies if necessary :
```
npm update
```

### Go to the Server folder

### Update npm packages
``` 
npm update
```

### Update gulpfile.js (task scripts) if you want to add your own files:
```
/**
 * Concat all js files in order into one big js file and minify it.
 * Do not hesitate to update it if you need to add your own files.
 */
gulp.task('scripts', function() {
  return gulp.src([
        'vorlon/vorlon.tools.js',
        'vorlon/vorlon.enums.js',
        'vorlon/vorlon.clientMessenger.js',
        'vorlon/vorlon.core.js',
      ....
```

## From the javascript source
### Build Vorlon.js from the javascript files:

```
gulp
```
Will be generated :
- build/Vorlon.js
- build/Vorlon.max.js

### Build Vorlon.js when you save a javascript file:
```
gulp watch
```

## From the typescript source
### Build Vorlon.js from the typescript files:

```
gulp typescript
```
Will be generated :
- build/Vorlon.js
- build/Vorlon.d.ts
- build/Vorlon.max.js

Be aware that all js files content will be overwrite.

### Build Vorlon.js when you save a typescript file:
```
gulp watch-typescript
```

### Compile all the typscript files to their javascript respective files
```
gulp typescript-to-js
```

Be aware that all js files content will be overwrite.

### Build the typescript declaration file
```
gulp typescript-declaration
```
