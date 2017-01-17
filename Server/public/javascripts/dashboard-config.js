$.get(VORLON.DashboardManager.CatalogUrl, function(data) {
     data = data.plugins;
     $('.countPlugins').text(data.length);
     for (var plugin in data) {
         
        var tmp = {
            name: data[plugin].name,
            checked: (data[plugin].enabled) ? 'checked=checked' : '',
            nodeClass: (data[plugin].nodeCompliant) ? 'nodeCompliant_enable' : 'nodeCompliant_disable',
            selectedTop: (data[plugin].panel == 'top') ? 'selected=selected' : '',
            selectedBottom: (data[plugin].panel == 'bottom') ? 'selected=selected' : '',
            nodeText: (data[plugin].nodeCompliant) ? 'This plugin is Node.JS compatible' : 'This plugin is not Node.JS compatible',
            id: data[plugin].id,
            folder: data[plugin].foldername
        }
         
        $('.plugins-list').append('<li class="plugin-'+tmp.id+'" data-id="'+tmp.id+'"><div class="calque"></div><h4><img src="'+VORLON.DashboardManager.vorlonBaseURL+'/getplugin/'+tmp.folder+'/icon" alt="icon"> <input data-id="'+tmp.id+'" type="text" value="'+tmp.name+'"> <span>'+tmp.name+' </span><i class="fa fa-pencil"></i></h4><img src="'+VORLON.DashboardManager.vorlonBaseURL+'/images/nodejs.png" title="'+tmp.nodeText+'" data-placement="top" alt="nodeCompliant" class="'+tmp.nodeClass+' nodeCompliant"><div class="panel_option"><label for="panel_select">Panel</label><select data-id="'+tmp.id+'" id="panel_select" class="panel_select"><option '+tmp.selectedTop+' value="top">Top</option><option value="bottom" '+tmp.selectedBottom+'>Bottom</option></select></div><div class="state_option"><label>State<input id="cb-'+tmp.id+'" '+tmp.checked+' type="checkbox" class="tgl tgl-skewed" data-id="'+tmp.id+'"><label data-tg-off="OFF" data-tg-on="ON" for="cb-'+tmp.id+'" class="tgl-btn"></label></label></div><i class="fa fa-arrows" aria-hidden="true"></i></li>');

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
    $('.plugin-' + id).find('.calque').fadeIn();
    setTimeout(function() {
        $.get(VORLON.DashboardManager.vorlonBaseURL + '/setplugin/' + id + '/state', function(data) {
            $('.plugin-' + id).find('.calque').fadeOut();
        });
    }, 500);
});

$('.plugins-list').on('change', '.panel_select', function() {
    var id = $(this).data('id');
    var panel = $(this).val();
    $('.plugin-' + id).find('.calque').fadeIn();
    setTimeout(function() {
        $.post(VORLON.DashboardManager.vorlonBaseURL + '/setplugin/' + id + '/panel', {panel: panel},function(data) {
            $('.plugin-' + id).find('.calque').fadeOut();
        });
    }, 500);
});

$('.plugins-list').on('click', 'h4', function() {
    var that = this
    $(this).find('span').fadeOut(function() {
        $(that).find('input').fadeIn().css("display","inline-block").focus();;
    });
});

$('.plugins-list').on('keypress', 'h4 input', function(e) {
    if(e.which == 13) {
        var id = $(this).data('id');
        var name = $(this).val();
        $('.plugin-' + id).find('.calque').fadeIn();
        var that = this;
        setTimeout(function() {
            $.post(VORLON.DashboardManager.vorlonBaseURL + '/setplugin/' + id + '/name', {name: name},function(data) {
                $('.plugin-' + id).find('.calque').fadeOut();
                $(that).fadeOut(function() {
                    $(that).val(name);
                    $(that).parent().find('span').text(name).fadeIn().css("display","inline-block");
                });
            });
        }, 500);
    }
});

$( ".plugins-list" ).sortable({
    update: function( event, ui ) {
        var positions = [];
        $('.plugins-list li').each(function() {
            positions.push($(this).data('id'));
        }); 
        $('.plugins-list li').find('.calque').fadeIn();
        setTimeout(function() {
            $.post(VORLON.DashboardManager.vorlonBaseURL + '/setplugin/positions', {positions: JSON.stringify(positions)},function(data) {
                $('.plugins-list li').find('.calque').fadeOut();
            });
        }, 500);
    },
    placeholder: "ui-state-highlight",
    start: function (event, ui) {
        ui.item.css('border', '1px solid #6B2D81');
    },
    stop: function (event, ui) {
        ui.item.css('border', '');
    }
});

$( ".plugins-list" ).disableSelection();

$('.config-wrapper .fa-search').click(function() {
    if ($('.search-config input').width() > 0) {
        $('.search-config input').css({'width': '0px', 'background-color': '#FFFFFF'});
    } else {
        $('.search-config input').css({'width': '200px', 'background-color': '#7E6288'});
        $('.search-config input').focus();
    }
});

$(".search-config input").keyup(function () {
    var filter = $(this).val();
    $(".plugins-list li").each(function () {
        if ($(this).text().search(new RegExp(filter, "i")) < 0) {
            $(this).hide();
        } else {
            $(this).show()
        }
    });
});

$(".search-config input").keydown(function (e) {
    if(e.which == 13 || e.which == 27) {
        $('.config-wrapper .fa-search').trigger('click');
    }
});
