# Vorlon.JS

A new, open source, extensible, platform-agnostic tool for remotely debugging and testing your JavaScript. Powered by node.js and socket.io.

Learn more at [VorlonJS](http://vorlonjs.com).


## Easy setup

Install and run the Vorlon.JS server from npm:

```
$ npm i -g vorlon
$ vorlon
With the server is running, open http://localhost:1337 in your browser to see the Vorlon.JS dashboard.
```

The last step is to enable Vorlon.JS by adding this to your app:

```
<script src="http://localhost:1337/client.js"></script>
```

## Documentation

Read further documentation about Vorlon.JS, and writing your own plugins at [http://vorlonjs.conm/documentation](http://vorlonjs.com/documentation).

## Developing on Vorlon.JS

To compile typescript and start the Vorlon.JS server from checked out code run `npm start`, or to just build typescript you can run `npm build`. Compiled JS should not be checked into the repo, it will be compiled and pushed to npm as part of the preinstall step once changes are merged.

### Visual Studio users

For Visual Studio users, we provide an integrated solution through VorlonJS.sln. In order to interact with Node.js, you just need to install the NodeJS Tool for Visual Studio [plugin](https://nodejstools.codeplex.com/).
Once the plugin is installed, just open the solution and you'll be ready to develop for Vorlon.js.

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) for more info on contributing to Vorlon.JS.

## License

Vorlon.JS is released under the MIT license. Please see [LICENSE](./LICENSE) for full details.
