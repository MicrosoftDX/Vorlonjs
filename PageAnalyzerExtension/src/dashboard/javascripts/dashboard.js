jQuery(function ($) {
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
});
