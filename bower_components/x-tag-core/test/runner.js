var browsers = [
  {
    'os' : 'Windows',
    'os_version' : '7',
    'resolution' : '1024x768',
    'browser' : 'Firefox',
    'browser_version': '14'
  },
  {
    'os' : 'Windows',
    'os_version' : '7',
    'resolution' : '1024x768',
    'browser' : 'Firefox',
    'browser_version': '26'
  },
  {
    'os' : 'Windows',
    'os_version' : '7',
    'resolution' : '1024x768',
    'browser' : 'Chrome',
    'browser_version': '19'
  },
  {
    'os' : 'Windows',
    'os_version' : '7',
    'resolution' : '1024x768',
    'browser' : 'Chrome',
    'browser_version': '31'
  },
  {
    'os' : 'Windows',
    'os_version' : '7',
    'resolution' : '1024x768',
    'browser' : 'IE',
    'browser_version': '9'
  },
  {
    'os' : 'Windows',
    'os_version' : '8.1',
    'resolution' : '1024x768',
    'browser' : 'IE',
    'browser_version': '11'
  },
  {
    'os' : 'OS X',
    'os_version' : 'Lion',
    'resolution' : '1024x768',
    'browser' : 'Safari',
    'browser_version' : '6.0'
  },
  {
    'os' : 'OS X',
    'os_version' : 'Mavericks',
    'resolution' : '1024x768',
    'browser' : 'Safari',
    'browser_version' : '7.0'
  },
  /*
  {  // fails 37 specs, DOMComponentsLoaded does not fire
    'browserName' : 'iPhone',
    'platform' : 'MAC',
    'device' : 'iPhone 4S'
  },
  { // fails
    'browserName' : 'iPad',
    'platform' : 'MAC',
    'device' : 'iPad 2 (5.0)'
  },
  {
    // android 4.0,  fails
    //x-tag using testbox should allow a custom prototype to be used.
    //x-tag using testbox should be able to extend existing elements.

    'browserName' : 'android',
    'platform' : 'ANDROID',
    'device' : 'Samsung Galaxy Nexus'
  },
  {   // android 4.1  fails
    'browserName' : 'android',
    'platform' : 'ANDROID',
    'device' : 'Samsung Galaxy S III'
  },
  {   // android 4.2 , fails
    'browserName' : 'android',
    'platform' : 'ANDROID',
    'device' : 'LG Nexus 4'
  }*/
];


var extend = require('util')._extend,
  async = require('async'),
  webdriver = require('browserstack-webdriver'),
  By = webdriver.By,
  spawn = require('child_process').spawn,
  connect = spawn('grunt',['connect:test']),
  java = null;

connect.stdout.setEncoding('utf8');
connect.stderr.setEncoding('utf8');
connect.stdout.on('data', function(d){
  console.log('connect:', d);
});
connect.stderr.on('data', function (data) {
  console.log('connect-err:' + data);
});


setTimeout(function(){
  java = spawn('java',['-jar',
    process.cwd() +'/test/tools/BrowserStackTunnel.jar',
    process.env.DEV_KEY, 'localhost,9000,0']);

    java.stdout.setEncoding('utf8');
    java.stdout.on('data', function(d){
      d = d.replace(process.env.DEV_KEY,'[secret]');
      console.log('java:', d);
      if (~d.indexOf('http://localhost:9000')) {
        console.log('starting webdriver');
try {
          runWebDriver(function(err){
            console.log('completed... shutting down');
            connect.kill();
            java.kill();
            process.exit((err||'').length);
          });
} catch(e) {
  console.log(e);
  connect.kill();
  java.kill();
  process.exit(99);
}

      }
    });
    java.stderr.on('data', function (data) {
      console.log('java-err:' + data);
    });

}, 3000);





function runWebDriver(callback){
  async.eachLimit(browsers, 1, function(browser, cb){
    var webdriverConfig = extend({},browser);
    webdriverConfig['browserstack.tunnel'] = 'true';
    webdriverConfig['browserstack.user'] = process.env.DEV_ID;
    webdriverConfig['browserstack.key'] = process.env.DEV_KEY;

    var driver = new webdriver.Builder().
    usingServer('http://hub.browserstack.com/wd/hub').
    withCapabilities(webdriverConfig).
    build();

    var nodeNotFound = function(err){
      console.log(JSON.stringify(browser),'->', err);
      driver.quit();
      cb();
    }

    driver.get('http://localhost:9000/test/index.html');

    driver.getTitle().then(function(title) {
      //console.log(JSON.stringify(browser), '--', title);
      setTimeout(function(){
        driver.isElementPresent(By.className('passingAlert')).then(function(passed){
          if (passed){
            driver.findElement(By.className('passingAlert')).then(function(node){
              node.getText().then(function(txt){
                console.log(JSON.stringify(browser),'--',txt);
                driver.quit();
                cb();
              });
            }, nodeNotFound);
          } else {
            driver.findElement(By.className('failingAlert')).then(function(node){
              node.getText().then(function(txt){
                console.log(JSON.stringify(browser),'--', txt);
                driver.findElements(By.css('.specDetail.failed > a.description')).then(function(nodes){
                  async.each(nodes, function(n, completed){
                    n.getText().then(function(t){
                      console.log(JSON.stringify(browser),'--', t);
                      completed();
                    });
                  }, function(){
                    driver.quit();
                    cb(txt);
                  });
                });
              });
            }, nodeNotFound);
          }
        }, nodeNotFound);
      }, 10000); // wait for all tests to run
    });
  }, callback);
}

process.on('exit', function() {
  connect.kill();
  if(java) java.kill();
});
