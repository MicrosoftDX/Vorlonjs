


describe("x-tag ", function () {

  it('should load x-tag.js and fire DOMComponentsLoaded', function (){

    var DOMComponentsLoaded = false;
    var WebComponentsReady = true;
    var HTMLImportsLoaded = false;

    document.addEventListener('DOMComponentsLoaded', function (){
      DOMComponentsLoaded = true;
    });

    window.addEventListener('WebComponentsReady', function (){
      WebComponentsReady = true;
    });

    window.addEventListener('HTMLImportsLoaded', function (){
      HTMLImportsLoaded = true;
    });

    var xtagLoaded = false,
        script = document.createElement('script');

    script.type = 'text/javascript';
    script.onload = function(){
      xtagLoaded = true;
      DOMComponentsLoaded = true;
    };

    document.querySelector('head').appendChild(script);
    script.src = '../src/core.js?d=' + new Date().getTime();

    waitsFor(function(){
      return xtagLoaded && DOMComponentsLoaded && WebComponentsReady && xtag;
    }, "document.register should be polyfilled", 1000);

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
    }, "new tag lifecycle event CREATED should fire", 500);

    runs(function (){
      expect(existing.foo).toEqual('bar');
    });
  });

  it('all new element proto objects should be unique', function (){
    var createdFired = false;
    xtag.register('x-unique', {
      lifecycle: {
        created: function (){
          createdFired = true;
        }
      }
    });

    var u1 = document.createElement('x-unique');
    var u2 = document.createElement('x-unique');

    waitsFor(function (){
      return createdFired;
    }, "new tag lifecycle event CREATED should fire", 500);

    runs(function (){
      expect(u1.xtag == u2.xtag).toEqual(false);
    });
  });

  it('all elements should be parsed for attributes and sync to setters', function (){
    var createdFired = false,
        foo = 0,
        bar = 0,
        baz = 0,
        zoo = 0;

    xtag.register('x-attr', {
      lifecycle: {
        created: function (){
          createdFired = true;
          this.innerHTML = '<div foo="bar">';
        }
      },
      accessors: {
        foo: {
          attribute: {
            selector: 'div'
          },
          set: function (value){
            foo++;
          }
        },
        bar: {
          attribute: { boolean: true },
          set: function (value){
            bar++;
          }
        },
        baz: {
          attribute: {},
          set: function (value){
            baz++;
          }
        },
        zoo: {
          attribute: { boolean: true },
          set: function (value){
            zoo++;
          }
        }
      }
    });

    var el = document.getElementById('attr_element');
    //var el = document.createElement('x-attr');

    el.foo = 'foo-1';
    el.setAttribute('foo', 'foo-2');
    el.setAttribute('foo', 'foo-2');
    el.foo = 'foo-2';
    el.removeAttribute('foo');
    el.setAttribute('foo', 'foo-3');

    el.setAttribute('bar', true);
    el.bar = false;
    el.bar = true;
    el.removeAttribute('bar');
    el.bar = 'bar';
    el.bar = false;

    el.baz = 'baz-0';
    el.removeAttribute('baz');
    el.setAttribute('baz', 'baz-1');
    el.setAttribute('baz', 'baz-1');
    el.removeAttribute('baz');

    el.zoo = false;
    el.zoo = true;
    el.removeAttribute('zoo');
    el.setAttribute('zoo', true);
    el.setAttribute('zoo', true);
    el.zoo = true;

    waitsFor(function (){
      return createdFired;
    }, "new tag lifecycle event CREATED should fire", 500);

    runs(function (){
      expect(el.foo).toEqual('foo-3');
      expect(el.getAttribute('foo')).toEqual('foo-3');

      expect(el.bar).toEqual(false);
      expect(el.getAttribute('bar')).toEqual(null);

      expect(el.baz).toEqual(null);
      expect(el.getAttribute('baz')).toEqual(null);

      expect(el.zoo).toEqual(true);
      expect(el.getAttribute('zoo')).toEqual('');

      expect(foo == 6 && bar == 7 && baz == 6 && zoo == 7).toEqual(true);
    });
  });

  it('should fire attributeChanged any attributes are updated', function(){

    var attributeChanged = false;

    xtag.register('x-foo1', {
      lifecycle: {
        attributeChanged: function(){
          attributeChanged = true;
        }
      }
    });

    var foo1 = document.createElement('x-foo1');
    foo1.setAttribute('foo', 'bar');
    foo1.setAttribute('foo', 'adf');

    waitsFor(function(){
      return attributeChanged;
    });

    runs(function (){
      expect(attributeChanged).toEqual(true);
    });
  });


  it('should fire lifecycle event CREATED when a new tag is created', function (){
    var createdFired = false;
    xtag.register('x-foo2', {
      lifecycle: {
        created: function (){
          createdFired = true;
        }
      }
    });

    var foo = document.createElement('x-foo2');

    waitsFor(function (){
      return createdFired;
    }, "new tag lifecycle event CREATED should fire", 500);

    runs(function (){
      expect(createdFired).toEqual(true);
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
      }, "new tag lifecycle event {created} should fire", 500);

      runs(function (){
        var fooElement = document.getElementById('foo');
        expect(created).toEqual(true);
        expect(fooElement.bar()).toEqual(true);
      });
    });


    it('should fire CREATED when custom element is added within a parent to innerHTML', function (){
      var created = false;

      xtag.register('x-foo4', {
        lifecycle: {
          created: function(){
            created = true;
          }
        },
        methods: {
          bar: function (){
            return true;
          },
          zoo: function(){
            return true;
          }
        }
      });

      xtag.set(testbox, 'innerHTML', '<div><x-foo4 id="foo" class="zoo"></x-foo4></div>');

      waitsFor(function (){
        return created;
      }, "new tag lifecycle event {created} should fire", 500);

      runs(function (){
        var fooElement = document.getElementById('foo');
        expect(created).toEqual(true);
        expect(fooElement.bar()).toEqual(true);
      });
    });

    it('should fire INSERTED when injected into the DOM', function (){
      var inserted = false;
      xtag.register('x-foo5', {
        lifecycle: {
          inserted: function (){
            inserted = true;
          }
        }
      });

      var foo = document.createElement('x-foo5');
      testbox.appendChild(foo);
      waitsFor(function (){
        return inserted;
      }, "new tag onInsert should fire", 1000);

      runs(function (){
        expect(inserted).toEqual(true);
      });
    });

    it('should fire REMOVED when removed into the DOM (w/inserted)', function (){
      var removed = false;
      xtag.register('x-foo5-removed', {
        lifecycle: {
          inserted: function (){},
          removed: function (){
            removed = true;
          }
        }
      });

      var foo = document.createElement('x-foo5-removed');
      testbox.appendChild(foo);
      setTimeout(function(){
        testbox.removeChild(foo);
      },100);

      waitsFor(function (){
        return removed;
      }, "new tag removed should fire", 500);

      runs(function (){
        expect(removed).toEqual(true);
      });
    });

    it('should fire REMOVED when removed into the DOM', function (){
      var removed = false;
      xtag.register('x-foo5-removed-1', {
        lifecycle: {
          removed: function (){
            removed = true;
          }
        }
      });

      var foo = document.createElement('x-foo5-removed-1');
      testbox.appendChild(foo);
      setTimeout(function(){
        testbox.removeChild(foo);
      },100);
      waitsFor(function (){
        return removed;
      }, "new tag removed should fire", 500);

      runs(function (){
        expect(removed).toEqual(true);
      });
    });

    it('should parse new tag as soon as it is registered', function (){
      var foo = document.createElement('x-foo6');

      testbox.appendChild(foo);

      xtag.register('x-foo6', {
        methods: {
          bar: function(){ return 'baz'; }
        }
      });

      runs(function (){
        expect(foo.bar()).toEqual('baz');
      });
    });

    it('should register methods for element', function (){

      xtag.register('x-foo7', {
        methods: {
          baz: function (){ }
        }
      });

      var foo = document.createElement('x-foo7');
      testbox.appendChild(foo);

      expect(foo.baz).toBeDefined();

    });

    it('should register getters for element', function (){

      xtag.register('x-foo8', {
        accessors: {
          name: {
            get: function (){
              return this.nodeName;
            }
          }
        }
      });

      var foo = document.createElement('x-foo8');
      testbox.appendChild(foo);

      expect(foo.name).toEqual('X-FOO8');

    });

    it('should register setters for element', function (){

      xtag.register('x-foo9', {
        accessors: {
          name: {
            set: function (value){
              this.setAttribute('name', value);
            }
          }
        }
      });

      var foo = document.createElement('x-foo9');
      testbox.appendChild(foo);
      foo.name = 'pizza';

      expect(foo.getAttribute('name')).toEqual('pizza');

    });

    it('xtag.innerHTML should instantiate x-tags in innerHTML', function (){
      xtag.register('x-foo10', {
        accessors: {
          name: {
            set: function (value){
              this.setAttribute('name', value);
            }
          }
        }
      });
      xtag.innerHTML(testbox, '<x-foo10 id="foo"></x-foo10>');
      var foo = document.getElementById('foo');
      foo.name = "Bob";
      expect(foo.getAttribute('name')).toEqual('Bob');
    });

    it('should only fire INSERT when inserted into the DOM', function (){
      var inserted = false;
      xtag.register('x-foo11', {
        lifecycle: {
          inserted: function (){
            inserted = true;
          }
        }
      });
      var temp = document.createElement('div');
      temp.id = 'ZZZZZZZZZZZZZZZZZZZZZ';
      temp.appendChild(document.createElement('x-foo11'));
      expect(inserted).toEqual(false);

      testbox.appendChild(temp);

      waitsFor(function (){
        return inserted;
      }, "new tag onInsert should fire", 500);

      runs(function (){
        expect(inserted).toEqual(true);
      });
    });

    it("mixins should not override existing properties", function (){
      var onCreateFired = 0;
      xtag.mixins.test = {
        lifecycle: {
          created: function (){
            onCreateFired++;
          }
        }
      };

      xtag.register('x-foo12', {
        mixins: ['test'],
        lifecycle: {
          created: function (){
            onCreateFired++;
          }
        }
      });

      var foo = document.createElement('x-foo12');

      expect(2).toEqual(onCreateFired);
    });

    it("should create a mixin, fire CREATED", function (){
      var onCreateFired = false;
      xtag.mixins.test = {
        lifecycle: {
          created: function (){
            onCreateFired = true;
          }
        }
      };

      xtag.register('x-foo13', {
        mixins: ['test']
      });

      var foo = document.createElement('x-foo13');
      expect(true).toEqual(onCreateFired);
    });

    it("should create a mixin, fire inserted", function (){
      var onInsertFired = false;
      xtag.mixins.test = {
        lifecycle: {
          inserted: function (){
            onInsertFired = true;
          }
        }
      };

      xtag.register('x-foo14', {
        mixins: ['test']
      });

      var foo = document.createElement('x-foo14');
      testbox.appendChild(foo);

      waitsFor(function (){
        return onInsertFired;
      }, "new tag mixin inserted should fire", 500);

      runs(function (){
        expect(true).toEqual(onInsertFired);
      });
    });

    it("mixins should wrap functions by default", function (){
      var count = 0,
          mixinFired,
          originalFired;

      xtag.mixins.wrapFn = {
        lifecycle: {
          created: function (){
            mixinFired = ++count;
          }
        }
      };

      xtag.register('x-foo-mixin-fn', {
        mixins: ['wrapFn'],
        lifecycle: {
          'created:mixins': function (){
            originalFired = ++count;
          }
        }
      });

      var foo = document.createElement('x-foo-mixin-fn');

      waitsFor(function (){
        return mixinFired && originalFired;
      }, "new tag mixin created should fire", 500);

      runs(function (){
        expect(1).toEqual(mixinFired);
        expect(2).toEqual(originalFired);
      });
    });

    it("should fire all mixins, even when there is no base function", function (){
      var count = 0,
          mixinOne,
          mixinTwo;

      xtag.mixins.mixinOne = {
        lifecycle: {
          created: function (){
            mixinOne = ++count;
          }
        }
      };

      xtag.mixins.mixinTwo = {
        lifecycle: {
          created: function (){
            mixinTwo = ++count;
          }
        }
      };

      xtag.register('x-foo-multi-mixin', {
        mixins: ['mixinOne', 'mixinTwo']
      });

      var foo = document.createElement('x-foo-multi-mixin');

      waitsFor(function (){
        return count == 2;
      }, "new tag mixin created should fire", 500);

      runs(function (){
        expect(2).toEqual(mixinOne);
        expect(1).toEqual(mixinTwo);
      });
    });

    it("it should fire the mixin created function BEFORE the element's", function (){
      var count = 0,
          createdFired1,
          createdFired2;

      xtag.mixins.test = {
        lifecycle: {
          created: function (){
            createdFired1 = ++count;
          }
        }
      };

      xtag.register('x-foo15', {
        mixins: ['test'],
        lifecycle: {
          'created:mixins(before)': function (){
            createdFired2 = ++count;
          }
        }
      });

      var foo = document.createElement('x-foo15');
      testbox.appendChild(foo);

      waitsFor(function (){
        return createdFired1 && createdFired2;
      }, "new tag mixin created should fire", 500);

      runs(function (){
        expect(1).toEqual(createdFired1);
        expect(2).toEqual(createdFired2);
      });
    });

    it("it should fire the mixin created function AFTER the element's", function (){
      var count = 0,
          createdFired1,
          createdFired2;

      xtag.mixins.test = {
        lifecycle: {
          'created': function (){
            createdFired2 = ++count;
          }
        }
      };

      xtag.register('x-foo16', {
        mixins: ['test'],
        lifecycle: {
          'created:mixins(after)': function (){
            createdFired1 = ++count;
          }
        }
      });

      var foo = document.createElement('x-foo16');
      testbox.appendChild(foo);

      waitsFor(function (){
        return createdFired1 && createdFired2;
      }, "new tag mixin created should fire", 500);

      runs(function (){
        expect(1).toEqual(createdFired1);
        expect(2).toEqual(createdFired2);
      });
    });

    it("it should fire the mixin created function BEFORE, WHEN NO OPTION IS PASSED the element's", function (){
      var count = 0,
          createdFired1,
          createdFired2;

      xtag.mixins.test = {
        lifecycle: {
          'created': function (){
            createdFired2 = ++count;
          }
        }
      };

      xtag.register('x-foo17', {
        mixins: ['test'],
        lifecycle: {
          'created:mixins': function (){
            createdFired1 = ++count;
          }
        }
      });

      var foo = document.createElement('x-foo17');
      testbox.appendChild(foo);

      waitsFor(function (){
        return createdFired1 && createdFired2;
      }, "new tag mixin created should fire", 500);

      runs(function (){
        expect(2).toEqual(createdFired1);
        expect(1).toEqual(createdFired2);
      });
    });

    it("should allow mixins to create getters", function (){
      var count = 0, base, mixin;

      xtag.mixins.test = {
        accessors: {
          bar: {
            get: function (){
              mixin = ++count;
              return "barr";
            }
          }
        }
      };

      xtag.register('x-foo18', {
        mixins: ['test'],
        accessors: {
          bar: {
            'get:mixins': function (){
              base = ++count;
              return "barr";
            }
          }
        }
      });

      var foo = document.createElement('x-foo18');
      var testing = foo.bar;
      expect(mixin).toEqual(1);
      expect(base).toEqual(2);
    });

    it("should allow mixins to create setters", function (){
      xtag.mixins.test = {
        accessors: {
          foo: {
            set: function (value){
              this.setAttribute('foo', value);
            }
          }
        }
      };

      xtag.register('x-foo19', {
        mixins: ['test']
      });

      var foo = document.createElement('x-foo19');
      foo.foo = 'barr';

      expect('barr').toEqual(foo.getAttribute('foo'));
    });

    it("should allow mixins to handle events", function (){
      var mixinEvent1 = 0,
          mixinEvent2 = 0,
          mixinEvent3 = 0,
          mixinEvent4 = 0,
          count = 0;

      xtag.mixins.test = {
        events: {
          'click': function(e){
            mixinEvent1 = ++count;
          },
          'bar': function(){
            mixinEvent4 = ++count;
          }
        }
      };

      xtag.register('x-foo20', {
        mixins: ['test'],
        events: {
          'click': function(e){
            mixinEvent2 = ++count;
          },
          'foo': function(e){
              mixinEvent3 = ++count;
              xtag.fireEvent(this, 'bar');
          }
        }
      });

      var foo = document.createElement('x-foo20');
      testbox.appendChild(foo);

      xtag.fireEvent(foo, 'click');
      xtag.fireEvent(foo, 'foo');

      runs(function (){
        expect(mixinEvent1).toEqual(2);
        expect(mixinEvent2).toEqual(1);
        expect(mixinEvent3).toEqual(3);
        expect(mixinEvent4).toEqual(4);
      });
    });

    it('delegate event pseudo should pass the custom element as second param', function (){

      var customElement, currentTarget;

      xtag.register('x-foo21', {
        lifecycle: {
          created: function (){
            customElement = this;
            this.innerHTML = '<div><div></div></div>';
          }
        },
        events: {
          'click:delegate(div > div:first-child)': function (e, elem){
            currentTarget = e.currentTarget;
          }
        }
      });

      var foo = document.createElement('x-foo21');
      testbox.appendChild(foo);

      waitsFor(function (){
        return customElement;
      }, "new tag mixin onInsert should fire", 500);

      runs(function (){
        xtag.fireEvent(xtag.query(customElement, 'div')[1], 'click');
        expect(customElement).toEqual(currentTarget);
      });

    });

    it('delegate event pseudo should register a click on an inner element', function (){

      var clicked = false, customElement;

      xtag.register('x-foo22', {
        lifecycle: {
          created: function (){
            customElement = this;
            this.innerHTML = '<div><div></div></div>';
          }
        },
        events: {
          'click:delegate(div:not(:nth-child(2)))': function (e, elem){
            clicked = true;
          }
        }
      });

      var foo = document.createElement('x-foo22');
      testbox.appendChild(foo);

      waitsFor(function (){
        return customElement;
      }, "new tag mixin onInsert should fire", 500);

      runs(function (){
        xtag.fireEvent(xtag.query(customElement, 'div')[1], 'click');
        expect(clicked).toEqual(true);
      });

    });

    it('delegate event pseudo should register a click on an inner pseudo element', function (){

      var clicked = false, customElement;

      xtag.register('x-foo22-b', {
        lifecycle: {
          created: function (){
            customElement = this;
            this.innerHTML = '<div></div><div></div>';
          }
        },
        events: {
          'click:delegate(div:nth-child(2))': function (e, elem){
            clicked = true;
          }
        }
      });

      var foo = document.createElement('x-foo22-b');
      testbox.appendChild(foo);

      waitsFor(function (){
        return customElement;
      }, "new tag mixin onInsert should fire", 1000);

      runs(function (){
        xtag.fireEvent(xtag.query(customElement, 'div')[1], 'click');
        expect(clicked).toEqual(true);
      });

    });

    it('delegate event pseudo "this" should be the element filtered by pseudo', function (){

      var customElement, delegateElement;

      xtag.register('x-foo23', {
        lifecycle: {
          created: function (){
            customElement = this;
            this.innerHTML = '<div></div>';
          }
        },
        events: {
          'click:delegate(div)': function (e, elem){
            delegateElement = this;
          }
        }
      });

      var foo = document.createElement('x-foo23');
      testbox.appendChild(foo);

      waitsFor(function (){
        return customElement;
      }, "new tag mixin onInsert should fire", 500);

      runs(function (){
        xtag.fireEvent(xtag.query(customElement, 'div')[0], 'click');
        expect(delegateElement).toEqual(customElement.firstElementChild);
      });

    });

    it('delegate event pseudo should support chaining', function (){

      var clickThis = null;

      xtag.register('x-foo24', {
        lifecycle: {
          created: function (){
            this.innerHTML = '<div><foo><bazz></bazz></foo></div>';
          }
        },

        events: {
          'click:delegate(div):delegate(bazz)': function (e, elem){
            clickThis = this;
          }
        }
      });

      var foo = document.createElement('x-foo24');
      testbox.appendChild(foo);

      var innerDiv = xtag.query(foo,'bazz')[0];
      xtag.fireEvent(innerDiv,'click');

      expect(innerDiv).toEqual(clickThis);

    });

    it('setter foo should setAttribute foo on target', function (){

      xtag.register('x-foo25', {
        accessors:{
          foo: { attribute: {} }
        }
      });

      var foo = document.createElement('x-foo25');
      testbox.appendChild(foo);
      foo.foo = 'bar';

      expect(foo.getAttribute('foo')).toEqual('bar');

    });

    it('setter foo should setAttribute bar on target', function (){

      xtag.register('x-foo26', {
        accessors:{
          foo: {
            attribute: { name: 'bar' }
          }
        }
      });

      var foo = document.createElement('x-foo26');
      testbox.appendChild(foo);

      foo.foo = 'bar';

      expect(foo.getAttribute('bar')).toEqual('bar');

    });

    it('setter fooBar should auto link to the attribute name foo-bar', function (){

      xtag.register('x-foo-auto-attr-name', {
        accessors:{
          fooBar: {
            attribute: {}
          }
        }
      });

      var foo = document.createElement('x-foo-auto-attr-name');
      testbox.appendChild(foo);

      foo.fooBar = 'bar';

      expect(foo.getAttribute('foo-bar')).toEqual('bar');

    });

    it('setter fooBar should run the validate and pass along the modified value', function (){
      var filteredValue;
      xtag.register('x-foo-attr-validate', {
        accessors:{
          fooBar: {
            attribute: {
              validate: function(value){
                return value | 0;
              }
            },
            set: function(value){
              filteredValue = value;
            }
          }
        }
      });

      var foo = document.createElement('x-foo-attr-validate');
      testbox.appendChild(foo);

      foo.fooBar = 'bar';

      expect(foo.getAttribute('foo-bar')).toEqual('0');

    });

    it('x-tag pseudos should allow css pseudos', function (){

      var clickThis = null;

      xtag.register('x-foo27', {
        lifecycle: {
          created: function (){
            this.innerHTML = '<div><foo><bazz><button></button></bazz></foo></div>';
          }
        },
        events: {
          'click:delegate(div):delegate(bazz:first-child)': function (e, elem){
            clickThis = this;
          }
        }
      });

      var foo = document.createElement('x-foo27');
      testbox.appendChild(foo);

      var button = xtag.query(foo,'button')[0];
      xtag.fireEvent(button,'click');

      expect(button).toEqual(clickThis.childNodes[0]);

    });

    it('the currentTarget property should always be populated with the attached element', function (){

      var foo, count = 0;

      xtag.register('x-foo30', {
        events: {
          bar: function (e, elem){
            if (e.currentTarget == foo) count++;
          },
          click: function (e, elem){
            if (e.currentTarget == foo) count++;
          },
          barf: function(e, elem){
            if (e.currentTarget == foo) count++;
          },
          'barf:delegate(div)': function(e, elem){
            if (e.currentTarget == foo) count++;
          }
        }
      });

      foo = document.createElement('x-foo30');
      var d1 = document.createElement('div');
      foo.appendChild(d1);
      var foo2 = document.createElement('x-foo30');
      testbox.appendChild(foo);
      testbox.appendChild(foo2);

      var event = document.createEvent('MouseEvent');
      event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 1, null);
      foo.dispatchEvent(event);

      xtag.fireEvent(foo, 'bar');
      xtag.fireEvent(d1, 'barf');

      waitsFor(function(){
        return count == 4;
      }, 'both clicks to bubble', 500);

      runs(function (){
        expect(count).toEqual(4);
      });

    });

    it('custom event pseudo should fire', function (){

      var pseudoFired = false,
        clickThis = null;

      xtag.pseudos.blah = {
        action: function (pseudo, event){
          pseudoFired = true;
          event.foo = this;
          return true;
        }
      };

      xtag.register('x-foo28', {
        lifecycle: {
          created: function (){
            this.innerHTML = '<div><foo><bazz></bazz></foo></div>';
          }
        },
        events: {
          'click:delegate(div):blah:delegate(bazz)': function (e, elem){
            clickThis = this;
          }
        }
      });

      var foo = document.createElement('x-foo28');
      testbox.appendChild(foo);

      var innerDiv = xtag.query(foo,'bazz')[0];
      xtag.fireEvent(innerDiv,'click');

      expect(pseudoFired).toEqual(true);

      expect(innerDiv).toEqual(clickThis);

    });



    it('extends should allow elements to use other elements base functionality', function(){
      xtag.register("x-foo29", {
        extends: 'div',
        lifecycle: {
          created: function() {
            var nodes = xtag.createFragment('<div>hello</div>').cloneNode(true);
            this.appendChild(nodes);
          }
        }
      });

      var foo = document.createElement('div', 'x-foo29');
      expect(foo.innerHTML).toEqual('<div>hello</div>');

    });

    it('extends should instantiate elements in natural source', function(){
      xtag.register("x-extendelement1",{
        extends: 'div',
        lifecycle: {
          created: function() {
            var nodes = xtag.createFragment('<div>hello</div>').cloneNode(true);
            this.appendChild(nodes);
          }
        }
      });
      var foo = document.getElementById('extend_element');
      expect(foo.innerHTML).toEqual('<div>hello</div>');
    });


    it('is="" should bootstrap element', function(){
      var count = 0;
      xtag.register("x-superdivo", {
        extends: 'div',
        methods: {
          test: function(){
            count++;
          }
        }
      });

      var foo = document.createElement('div', 'x-superdivo');
      expect(foo.test).toBeDefined();
      foo.test();
      expect(count).toEqual(1);

    });

    it('should allow a custom prototype to be used', function(){
      var proto = Object.create(HTMLElement.prototype);
      proto.fn = function(){};
      xtag.register("x-foo-proto", {
        prototype: proto
      });

      var foo = document.createElement('x-foo-proto');
      testbox.appendChild(foo);

      expect(foo.fn).toBeDefined();
      expect(foo.click).toBeDefined();

    });

    it('should be able to extend existing elements', function(){
      xtag.register("x-foo-extend", {
        extends: 'input'
      });

      var foo = document.createElement('input', 'x-foo-extend');
      testbox.appendChild(foo);

      expect(foo.value).toBeDefined();

    });

    it('should pass the previous parentNode as the first parameter in the lifecycle removed callback', function(){
      var insertParent, removedParent, removed;
      xtag.register("x-foo31", {
        lifecycle: {
          inserted: function() {
            insertParent = this.parentNode;
          },
          removed: function(parent) {
            if(!removed) {
              removedParent = parent;
              removed = true;
            }
          }
        }
      });

      var foo = document.createElement('x-foo31');
      testbox.appendChild(foo);
      setTimeout(function(){ testbox.removeChild(foo); }, 200);
      waitsFor(function(){
        return removed;
      }, 'removed to be passed the last parentNode', 300);

      runs(function (){
        expect(insertParent == removedParent).toEqual(true);
      });
    });

    it('should add Shadow DOM to the element', function (){
      xtag.register('x-foo-shadow', {
        shadow: '<div>bar</div>'
      });

      var foo = document.createElement('x-foo-shadow');
      expect(Element.prototype.createShadowRoot ? foo.shadowRoot.firstElementChild.textContent == 'bar' : !foo.firstElementChild).toEqual(true);
    });

    it('should add default content to the element', function (){
      xtag.register('x-foo-content', {
        content: '<div>bar</div>'
      });

      var foo = document.createElement('x-foo-content');
      expect(foo.firstElementChild.textContent).toEqual('bar');
    });
  });

  describe('helper methods', function (){
    describe('class', function (){
      var body;

      beforeEach(function (){
        body = document.body;
      });

      afterEach(function (){
        body.removeAttribute('class');
      });

      it('hasClass', function (){
        expect(xtag.hasClass(body, 'foo')).toEqual(false);
        body.setAttribute('class', 'foo');
        expect(xtag.hasClass(body, 'foo')).toEqual(true);
      });

      it('addClass', function (){
        expect(xtag.hasClass(body, 'foo')).toEqual(false);
        xtag.addClass(body,'foo');
        expect(xtag.hasClass(body, 'foo')).toEqual(true);

        xtag.addClass(body,'bar');
        expect(xtag.hasClass(body, 'bar')).toEqual(true);
        expect('foo bar').toEqual(body.getAttribute('class'));
        expect(2).toEqual(body.getAttribute('class').split(' ').length);

        xtag.addClass(body,'biz red');

        expect('foo bar biz red').toEqual(body.getAttribute('class'));

        // prevent dups
        xtag.addClass(body,'foo red');
        expect('foo bar biz red').toEqual(body.getAttribute('class'));

      });

      it('removeClass', function (){
        xtag.addClass(body,'foo');
        xtag.addClass(body,'bar');
        xtag.addClass(body,'baz');
        expect('foo bar baz').toEqual(body.getAttribute('class'));

        xtag.removeClass(body,'bar');
        expect('foo baz').toEqual(body.getAttribute('class'));

        xtag.addClass(body,'bar');
        expect('foo baz bar').toEqual(body.getAttribute('class'));

        xtag.removeClass(body,'foo');
        expect('baz bar').toEqual(body.getAttribute('class'));

        xtag.removeClass(body,'baz');
        expect('bar').toEqual(body.getAttribute('class'));

        xtag.removeClass(body,'random');
        body.setAttribute('class','  foo  bar baz   red   ');

        xtag.removeClass(body,'bar');
        expect('foo baz red').toEqual(body.getAttribute('class'));
      });

      it('toggleClass', function (){
        xtag.toggleClass(body, 'foo');
        expect('foo').toEqual(body.getAttribute('class'));

        xtag.toggleClass(body, 'foo');
        expect('').toEqual(body.getAttribute('class'));

        xtag.addClass(body, 'baz');
        xtag.toggleClass(body, 'baz');
        expect('').toEqual(body.getAttribute('class'));

      });

      it('Random combination of Class tests', function (){
        body.setAttribute('class', 'flex-stack');
        xtag.addClass(body, 'small_desktop');
        expect('flex-stack small_desktop').toEqual(body.getAttribute('class'));

        body.setAttribute('class', 'flex-stack');
        xtag.addClass(body, 'small_desktop');
        xtag.removeClass(body, 'small_desktop');
        expect('flex-stack').toEqual(body.getAttribute('class'));

        body.setAttribute('class', 'small_desktop flex-stack');
        xtag.removeClass(body, 'small_desktop');
        expect('flex-stack').toEqual(body.getAttribute('class'));

        body.setAttribute('class', 'small_desktop flex-stack');
        xtag.removeClass(body, 'small_desktop');
        xtag.removeClass(body, 'large_desktop');
        expect('flex-stack').toEqual(body.getAttribute('class'));
      });
    });

    describe('utils', function (){
      it('typeOf', function (){
        expect('object').toEqual(xtag.typeOf({}));
        expect('array').toEqual(xtag.typeOf([]));
        expect('string').toEqual(xtag.typeOf('d'));
        expect('number').toEqual(xtag.typeOf(42));
      });

      it('toArray', function (){
        expect([]).toEqual(xtag.toArray({}));
      });

      it('uid', function(){
        expect(xtag.uid).toBeDefined();
        expect('string').toEqual(typeof xtag.uid());
      });

      describe('wrap', function(){
        it('should create new function that calls both functions', function(){
          var f1Called = false,
            f1 = function(){
              f1Called = true;
            };

          var f2Called = false,
            f2 = function(){
              f2Called = true;
            };

          var f3 = xtag.wrap(f1, f2);
          f3();

          expect(f1Called).toEqual(true);
          expect(f2Called).toEqual(true);
        });

      });

      it('queryChildren', function(){
        testbox.appendChild(document.createElement('a'));
        testbox.appendChild(document.createElement('a'));
        var div = document.createElement('div');
        div.appendChild(document.createElement('a'));
        testbox.appendChild(div);
        expect(2).toEqual(xtag.queryChildren(testbox, 'a').length);
        expect(div.parentElement).toBeDefined();
      });

      it('queryChildren no parent', function(){
        var div = document.createElement('div');
        div.appendChild(document.createElement('a'));
        div.appendChild(document.createElement('a'));
        expect(2).toEqual(xtag.queryChildren(div, 'a').length);
        expect(div.parentElement).toBeNull();
      });

    });
  });
});
