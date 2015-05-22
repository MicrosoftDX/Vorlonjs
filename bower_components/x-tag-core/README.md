# X-Tag - Custom Elements for Modern Browsers

[![Bower version](https://badge.fury.io/bo/x-tag-core.svg)](http://badge.fury.io/bo/x-tag-core)

[![Build Status](https://travis-ci.org/x-tag/core.png)](https://travis-ci.org/x-tag/core)

[![Selenium Test Status](https://saucelabs.com/browser-matrix/aschaar.svg)](https://saucelabs.com/u/aschaar)

**This is the repository for the core [X-Tag](http://x-tags.org) library.**

Based on the current W3 Web Components [draft][1], X-Tag enables the custom element portion of the proposal.
Custom elements let you register new tags/elements with the parser, so they are recognized and inflated with
special abilities you define.

You can find out more about what X-Tag does, where it works, and how to use it, on the project page: [http://x-tags.org](http://x-tags.org).

X-Tag (excluding third-party icons or images) is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.

  [1]: https://dvcs.w3.org/hg/webcomponents/raw-file/tip/explainer/index.html       "W3 Web Components Spec (Draft)"

## Getting started

To get started hacking on X-Tag core:

````bash
git clone https://github.com/x-tag/core x-tag-core --recursive
cd x-tag-core
npm install        # installs all the required dependencies using package.json
grunt build     # outputs x-tag-core.js and x-tag-core.min.js to ./dist
````

If you are interested in building your own custom elements, you can use our [web-component-stub](https://github.com/x-tag/web-component-stub) as a starting point.

## Updating

If you already cloned the library and want to update to the latest changes, do:

````bash
cd x-tag-core
git pull origin master
npm install
grunt build
````

This assumes you just cloned the library and its remote repository is labelled `origin`. Suppose you had your own fork where your own remote is `origin`; you should add another remote origin and label it as `upstream`. Then your `git pull` line would need to be `git pull upstream master` instead.

## Tests

Jasmine tests via grunt are not working yet, please open [test/index.html](test/index.html) in your browser to see if everything passes.


## Regenerating the distributable build

In the interest of not reinventing the wheel, X-Tag core uses a few existing libraries which get pulled into the project. But distributing a bunch of separate files is not efficient, so we need to generate a single file that contains all this code.

If you make changes on the library and want to regenerate the build, just run

````bash
grunt build
````

and both `x-tag-core.js` and `x-tag-core.min.js` will be rebuilt and placed in the `./dist` directory.


## Creating your own web components

To learn more about X-Tags visit [x-tags.org](http://x-tags.org).

To create your own component, use our [web-component-stub](https://github.com/x-tag/web-component-stub).

Share your components by adding them to the [Custom Elements Registry](http://customelements.io/) or Bower.
