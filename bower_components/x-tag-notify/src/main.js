(function(){
  
  xtag.register('x-notify', {
    lifecycle: {
      inserted: function(){
        this.parentNode.setAttribute('x-notify-parentnode', '');
      },
      removed: function(){
        if (!xtag.queryChildren(this.parentNode, 'x-notify')[0]) this.parentNode.removeAttribute('x-notify-parentnode');
      }
    },
    events: { 
      'tap:delegate([closable])': function(e){
        if (e.target == e.currentTarget) e.currentTarget.hide();
      }
    },
    accessors: {
      showing: {
        attribute: {
          boolean: true
        },
        set: function(val, old){
          val ? this.show() : this.hide();
        }
      },
      duration: {
        attribute: {validate: function(val){
          return val || 3000;
        }}
      }
    }, 
    methods: {
      'show:transition': function(){
        if (!this.showing) this.showing = true;
        clearTimeout(this.xtag.timer);
        if (this.duration){
          var node = this;
          this.xtag.timer = setTimeout(function(){ node.hide() }, this.duration);
        }
      },
      'hide:transition': function(){
        clearTimeout(this.xtag.timer);
        if (this.showing) this.showing = false;
      }
    }
  });

})();
