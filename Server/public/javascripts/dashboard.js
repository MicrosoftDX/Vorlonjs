jQuery(function($) {
  //Resizable panes
  $('.dashboard-plugins').split({
    orientation: 'horizontal',
    limit: 38
  });
  //$('.dom-explorer-container').split({orientation: 'vertical', limit: 50, position: '70%'});

  //Plugin tab navigation
  $('#pluginsPane').on('click', '[data-plugin-target]', function (e) {
    var target = $(this).data('plugin-target');

    $('#pluginsPane [data-plugin-target]').removeClass('active');
    $(this).addClass('active');
    $('#pluginsPane [data-plugin]').hide();
    $('#pluginsPane [data-plugin~=' + target + ']').show();
  })

  $('#pluginsPane [data-plugin-target]').first().click();
});
