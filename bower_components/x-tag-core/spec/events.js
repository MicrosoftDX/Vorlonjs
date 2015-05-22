


describe("x-tag ", function () {
  
  var $ = document.getElementById;
  
  var tap = $('tap'),
      tapCount = 0,
      tapTimer = null;
  
  xtag.addEvent($('tap'), 'tap', function(){
    
    tapCount++;
    tapTimer = setTimeout(function(){
      
    }, 1000);
  });

});
