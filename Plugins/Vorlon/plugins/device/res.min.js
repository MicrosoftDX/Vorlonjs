/*!
 * res 0.3.0+201410120233
 * https://github.com/ryanve/res
 * MIT License, 2014 Ryan Van Etten
 */
!function(a,b,c){"undefined"!=typeof module&&module.exports?module.exports=c(require):a[b]=c(function(b){return a[b]})}(this,"res",function(a){function b(b){return a("actual")("resolution",b.valueOf(),e[b])}function c(){return"undefined"==typeof window?0:+window.devicePixelRatio||Math.sqrt(screen.deviceXDPI*screen.deviceYDPI)/e.dpi||0}function d(a){var d=e[a];b[a]=1==d?c:function(){return c()*d}}var e={dppx:1,dpi:96,dpcm:96/2.54};return d("dppx"),d("dpcm"),d("dpi"),b});