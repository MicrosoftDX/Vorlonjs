jQuery(function($) {
  //Resizable panes
  $('.dashboard-plugins').split({
    orientation: 'horizontal',
    limit: 38
  });

  //Plugin tab navigation
  $('#pluginsPaneTop').on('click', '[data-plugin-target]', function (e) {
    var target = $(this).data('plugin-target');

    $('#pluginsPaneTop [data-plugin-target]').removeClass('active');
    $(this).addClass('active');
    $('#pluginsPaneTop [data-plugin]').hide();
    $('#pluginsPaneTop [data-plugin~=' + target + ']').show();
  });
  
  $('#pluginsPaneBottom').on('click', '[data-plugin-target]', function (e) {
    var target = $(this).data('plugin-target');

    $('#pluginsPaneBottom [data-plugin-target]').removeClass('active');
    $(this).addClass('active');
    $('#pluginsPaneBottom [data-plugin]').hide();
    $('#pluginsPaneBottom [data-plugin~=' + target + ']').show();
  });
});
