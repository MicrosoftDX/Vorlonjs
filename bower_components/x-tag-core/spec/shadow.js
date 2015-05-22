

var DOMComponentsLoaded = false;
var WebComponentsReady = false;
var HTMLImportsLoaded = false;

document.addEventListener('DOMComponentsLoaded', function (){
  DOMComponentsLoaded = true;
});

document.addEventListener('WebComponentsReady', function (){
  WebComponentsReady = true;
});

window.addEventListener('HTMLImportsLoaded', function (){
  HTMLImportsLoaded = true;
});

var xtagLoaded = false,
    core = document.createElement('script');
    core.onload = function(){
      xtagLoaded = true;
      DOMComponentsLoaded = true;
    };
    core.src = '../src/core.js?d=' + new Date().getTime();  
document.querySelector('head').appendChild(core);

describe("x-tag ", function () {

  it('should load x-tag.js and fire DOMComponentsLoaded', function (){

    waitsFor(function(){
      return xtagLoaded && DOMComponentsLoaded && WebComponentsReady && xtag;
    }, "document.register should be polyfilled", 2000);

    runs(function () {
      expect(xtag).toBeDefined();
    });
  });
 
  it('upgrades all elements synchronously when registered', function (){
    var createdFired = false;
    xtag.register('x-sync', {
      lifecycle: {
        created: function (){
          createdFired = true;
        }
      },
      accessors: {
        foo: {
          get: function(){
            return 'bar';
          }
        }
      }
    });

    var created = document.createElement('x-sync');
    var existing = document.getElementById('sync_element');

    waitsFor(function (){
      return createdFired;
    }, "new tag lifecycle event CREATED should fire", 1000);

    runs(function (){
      expect(existing.foo).toEqual('bar');
    });
  });

  it('should fire lifecycle event CREATED with its shadow root populated', function (){
    var shadowRootPopulated = false;
    xtag.register('x-shadowroot-created', {
      shadow: function(){/*  
          <div>foo</div>
      */},
      lifecycle: {
        created: function (){
          shadowRootPopulated = this.shadowRoot.firstChild.textContent == 'foo';
        }
      }
    });

    var foo = document.createElement('x-shadowroot-created');
    
    waitsFor(function (){
      return shadowRootPopulated;
    }, "new tag lifecycle event CREATED should fire", 1);

    runs(function (){
      expect(shadowRootPopulated).toEqual(true);
    });
  });
  
  it('should be styled correctly using X-Tag\'s Shadow DOM features', function (){
    var shadowRootStyled = false;
    xtag.register('x-shadowroot-styled', {
      shadow: function(){/* 
          <div>foo</div>
      */},
      lifecycle: {
        created: function (){
          shadowRootStyled = getComputedStyle(this.shadowRoot.firstChild).visibility == 'hidden';
        }
      }
    });

    var foo = document.createElement('x-shadowroot-styled');
    
    // document.body.appendChild(foo);
    
    waitsFor(function (){
      return shadowRootStyled;
    }, "new tag lifecycle event CREATED should fire", 1);

    runs(function (){
      expect(shadowRootStyled).toEqual(true);
    });
  });


  describe('using testbox', function (){
    var testbox;

    beforeEach(function (){
      testbox = document.getElementById('testbox');
    });

    afterEach(function (){
      testbox.innerHTML = "";
    });

    it('testbox should exist', function (){
      expect(testbox).toBeDefined();
    }); 

    it('should fire CREATED when tag is added to innerHTML', function (){
      var created = false;
      xtag.register('x-foo3', {
        lifecycle: {
          created: function (){
            created = true;
          }
        },
        methods: {
          bar: function (){
            return true;
          }
        }
      });

      xtag.set(testbox, 'innerHTML', '<x-foo3 id="foo"></x-foo3>');

      waitsFor(function (){
        return created;
      }, "new tag lifecycle event {created} should fire", 1000);

      runs(function (){
        var fooElement = document.getElementById('foo');
        expect(created).toEqual(true);
        expect(fooElement.bar()).toEqual(true);
      });
    });
    
  });
});
