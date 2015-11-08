Vorlon.js desktop
==============
This repository is for the desktop version of Vorlon.js. Set up could take a little time so packages for desktop app are not loaded when you initialize Vorlon repository.
The project has been initiated from [Electron boilerplate](https://github.com/szwacz/electron-boilerplate).

# Quick start
To run this from source, you will need Node.js, so just make sure you have it installed.

install all required packages by running
```
npm install
```
When everything is in place, run the following command :
```
npm start
```

# Making a release

**Note:** There are various icon and bitmap files in `resources` directory. Those are used in installers.

To make ready for distribution installer use command:
```
npm run release
```
It will start the packaging process for operating system you are running this command on. Ready for distribution file will be outputted to `releases` directory.

You can create Windows installer only when running on Windows, the same is true for Linux and OSX. So to generate all three installers you need all three operating systems.


## Special precautions for Windows
As installer [NSIS](http://nsis.sourceforge.net/Main_Page) is used. You have to install it (version 3.0), and add NSIS folder to PATH in Environment Variables, so it is reachable to scripts in this project (path should look something like `C:/Program Files (x86)/NSIS`).
