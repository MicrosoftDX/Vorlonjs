# Sample plugin

This is an example additional plugin for vorlon. It renders an input field into the Vorlon dashboard. If you type a message, it sends it to your client, which reverses it, and sends it back to be rendered into the dashboard.

You can use this as a starting point for your own plugins.

## Enabling the sample plugin

To enable the sample plugin:

1. Clone this github repo if you haven't already (`git clone git@github.com/MicrosoftDX/Vorlonjs`)
2. Modify `Server/config.json` to add the plugin, so it looks like this:

```json
{
    "includeSocketIO": true,
    "plugins": [
        { "id": "CONSOLE", "name": "Interactive Console", "panel": "bottom", "foldername" :  "interactiveConsole"},
        { "id": "DOM", "name": "Dom Explorer", "panel": "top", "foldername" : "domExplorer" },
        { "id": "MODERNIZR", "name": "Modernizr","panel": "bottom", "foldername" : "modernizrReport" },
        { "id" : "OBJEXPLORER", "name" : "Obj. Explorer","panel": "top", "foldername" :  "objectExplorer" },
        { "id" : "SAMPLE", "name" : "Sample","panel": "top", "foldername" : "sample" }
    ]
}
```

3. From the root directory of the repository, install dependencies with `npm install`, and start the server with `npm start` (make sure you kill any existing vorlon servers running on your machine. You can now navigate to the vorlon dashboard as normal, and you'll see an additional tab in the list.

## Modifying the plugin

The plugin is based on two files (one for the client and one for the dashboard) who respectively extend from VORLON.ClientPlugin and VORLON.DashboardPlugin, as defined in `Plugins/Vorlon/vorlon.clientPlugin.ts` and `Plugins/Vorlon/vorlon.dashboardPlugin.ts` so you can see what methods are available for your plugin from there. You may also wish to look at the other existing plugins in `Plugins/Vorlon/plugins` for ideas.

`control.html` will be inserted into the dashboard, as will `dashboard.css`.
