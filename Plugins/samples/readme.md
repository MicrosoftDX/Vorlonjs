#using Vorlon with browser-sync
You could use Vorlon with [browser-sync](http://www.browsersync.io) to debug your web pages. It will allow you to live reload or test your website on multiple devices at once.

To run Vorlon sample with browser-sync, run this command in this directory :
npm install

Then start your Vorlon server, and run this command (still in this directory) :
node browsersync

It will open Vorlon's sample page with this url : [http://localhost:3000](http://localhost:3000)

You can access browser-sync dashboard on this url : [http://localhost:3001](http://localhost:3001)

If you want to fine tune your browser-sync instance, please refer to [their documentation](http://www.browsersync.io/docs)