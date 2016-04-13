$.get(VORLON.DashboardManager.CatalogUrl, function(data) {
     data = data.plugins;
     for (var plugin in data) {
         
        var tmp = {
            name: data[plugin].name,
            checked: (data[plugin].enabled) ? 'checked=checked' : '',
            nodeClass: (data[plugin].nodeCompliant) ? 'nodeCompliant_enable' : 'nodeCompliant_disable',
            selectedTop: (data[plugin].panel == 'top') ? 'selected=selected' : '',
            selectedBottom: (data[plugin].panel == 'bottom') ? 'selected=selected' : '',
            nodeText: (data[plugin].nodeCompliant) ? 'This plugin do use NodeJS' : 'This plugin do not use NodeJS',
            id: data[plugin].id,
        }
         
        $('.plugins-list').append('<li class="plugin-'+tmp.id+'" data-id="'+tmp.id+'"><h4><img src="images/angular.png" alt="icon"> <input data-id="'+tmp.id+'" type="text" value="'+tmp.name+'"> <span>'+tmp.name+' <i class="fa fa-pencil"></i></span></h4><img src="images/nodejs.png" title="'+tmp.nodeText+'" data-placement="top" alt="nodeCompliant" class="'+tmp.nodeClass+' nodeCompliant"><div class="panel_option"><label for="panel_select">Panel</label><select data-id="'+tmp.id+'" id="panel_select" class="panel_select"><option '+tmp.selectedTop+' value="top">Top</option><option value="bottom" '+tmp.selectedBottom+'>Bottom</option></select></div><div class="state_option"><label>State<input id="cb-'+tmp.id+'" '+tmp.checked+' type="checkbox" class="tgl tgl-skewed" data-id="'+tmp.id+'"><label data-tg-off="OFF" data-tg-on="ON" for="cb-'+tmp.id+'" class="tgl-btn"></label></label></div></li>');

        $(document).tooltip({
            position: {
                my: "center top-50",
                at: "center top+5",
            },
            show: {
                duration: "fast"
            },
            hide: {
                effect: "hide"
            }
         });
    }
});

$('.plugins-list').on('change', '.tgl', function() {
    var id = $(this).data('id');
    $('.plugin-' + id).addClass('pluginLoad');
    $.get(VORLON.DashboardManager.vorlonBaseURL + '/setplugin/' + id + '/state', function(data) {
        $('.plugin-' + id).removeClass('pluginLoad');
    });
});

$('.plugins-list').on('change', '.panel_select', function() {
    var id = $(this).data('id');
    var panel = $(this).val();
    $('.plugin-' + id).addClass('pluginLoad');
    $.post(VORLON.DashboardManager.vorlonBaseURL + '/setplugin/' + id + '/panel', {panel: panel},function(data) {
        $('.plugin-' + id).removeClass('pluginLoad');
    });
});

$('.plugins-list').on('click', 'h4', function() {
    var that = this
    $(this).find('span').fadeOut(function() {
        $(that).find('input').fadeIn().css("display","inline-block");
    });
});

$('.plugins-list').on('keypress', 'h4 input', function(e) {
    if(e.which == 13) {
        var id = $(this).data('id');
        var name = $(this).val();
        $('.plugin-' + id).addClass('pluginLoad');
        var that = this;
        $.post(VORLON.DashboardManager.vorlonBaseURL + '/setplugin/' + id + '/name', {name: name},function(data) {
            $('.plugin-' + id).removeClass('pluginLoad');
            
            $(that).fadeOut(function() {
                $(that).val(name);
                $(that).parent().find('span').text(name).fadeIn().css("display","inline-block");
            });
        });
    }
});

$( ".plugins-list" ).sortable({update: function( event, ui ) {
    var positions = [];
    $('.plugins-list li').each(function() {
         positions.push($(this).data('id'));
    }); 
    $('.plugins-list li').addClass('pluginLoad');
    $.post(VORLON.DashboardManager.vorlonBaseURL + '/setplugin/positions', {positions: JSON.stringify(positions)},function(data) {
        $('.plugins-list li').removeClass('pluginLoad');
    });
}});

$( ".plugins-list" ).disableSelection();