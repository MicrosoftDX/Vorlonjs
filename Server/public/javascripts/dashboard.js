jQuery(function ($) {
    //Resizable panes
    $('.dashboard-plugins').split({
        orientation: 'horizontal',
        limit: 38
    });

    // Replace default url with the current one (running vorlon)
    $('#scriptSrc').text('<script src="{{location}}/vorlon.js"></script>'.replace('{{location}}', location.origin));

    //Plugin tab navigation
    $('#pluginsPaneTop').on('click', '[data-plugin-target]', function (e) {
        var $this = $(this);
        var target = $this.data('plugin-target');

        $('#pluginsPaneTop [data-plugin-target]').removeClass('active');
        $this.addClass('active');
        $('#pluginsPaneTop [data-plugin]')
                    .hide()
                    .trigger("vorlon.plugins.inactive");

        $('#pluginsPaneTop [data-plugin~=' + target + ']')
                    .show()
                    .trigger("vorlon.plugins.active");
    });

    $('#pluginsPaneBottom').on('click', '[data-plugin-target]', function (e) {
        var target = $(this).data('plugin-target');

        $('#pluginsPaneBottom [data-plugin-target]').removeClass('active');
        $(this).addClass('active');
        $('#pluginsPaneBottom [data-plugin]')
                    .hide()
                    .trigger("vorlon.plugins.inactive");
        $('#pluginsPaneBottom [data-plugin~=' + target + ']')
                    .show()
                    .trigger("vorlon.plugins.active");
    });
});
