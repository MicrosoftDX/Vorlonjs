var START_TIME = 0;
var FRAMES_PER_SECOND = 5;
var TIMELINE_SECONDS = 20;

var setNumberChanges = function (timeline) {
    document.querySelectorAll('.inline-changes-added span')[0].innerHTML = countStatus('added' ,timeline);
    document.querySelectorAll('.inline-changes-removed span')[0].innerHTML = countStatus('removed' ,timeline);
    document.querySelectorAll('.inline-changes-modified span')[0].innerHTML = countStatus('modified' ,timeline);    
}

var setChanges = function (changes) {
    
    changes.sort(function(a, b) { 
        return a.time - b.time;
    });
    
    var times = {};
    var max = {time: 0, count: 0};
    for (var i = 0, len = changes.length; i < len; i++) {
        details_table = '';
        for (var t = 0, lenT = changes[i].details.length; t < lenT; t++) {
            details_table += '<tr><td class="td-name">' + changes[i].details[t].name + ':</td><td class="td-value">' + changes[i].details[t].value + '</td></tr>';
        }
        var details = '<li class="acc" style="display:none;"><table>' + details_table + '</table></li>';
        document.querySelectorAll('.accordion-changes')[0].innerHTML += '<li data-id=" ' + i + ' " data-time=" ' + changes[i].time + ' " class="show-change acc-tr accordion-changes-' + changes[i].status + '">' + escapeHtml(changes[i].element) + ' ' + changes[i].status + ' <span>' + changes[i].time + 's</span><i class="fa fa-undo"></i></li>' + details;   
        if (typeof times[changes[i].time] === 'undefined') {
            times[changes[i].time] = {added: 0, removed: 0, modified: 0};
        }
        times[changes[i].time][changes[i].status]++;
        if (max.count < (times[changes[i].time].added + times[changes[i].time].removed + times[changes[i].time].modified)) {
            max.count = (times[changes[i].time].added + times[changes[i].time].removed + times[changes[i].time].modified);
            max.time = changes[i].time;
        }
    }
    
    
    for (var i = 0; i < document.getElementsByClassName('acc-tr').length; i++) {
        document.getElementsByClassName('acc-tr')[i].addEventListener('click', function(e) {
            if ($(this).hasClass('hide-change')) {
                e.preventDefault();
                return;
            }
            
            if ($(this.nextElementSibling).css('display') == 'none') {
                $(this.nextElementSibling).show();
            } else {
                $(this.nextElementSibling).hide();
            }
            
            var className = 'rotate';

            if ($(this.nextElementSibling).css('display') == 'block') {
                if (this.classList)
                this.classList.add(className);
                else
                this.className += ' ' + className;  
            } else {
                if (this.classList)
                this.classList.remove(className);
                else
                this.className = this.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
            }
        }, false);
    }
        
    for (var time in times) {
        var times_h = '<span data-hint="' + times[time].added + ' added" class="added_h hint--right hint--success" style="' + (((times[time].modified || times[time].removed) && times[time].added) ? 'border-bottom: 1px solid white;' : '') + 'height: ' + times[time].added * (85 / max.count) + 'px;"></span>';
        times_h += '<span data-hint="' + times[time].modified + ' modified" ' + ((!times[time].modified) ? 'style="border:none !important;"' : '') + ' class="modified_h hint--right hint--info" style="' + ((times[time].removed && times[time].modified) ? 'border-bottom: 1px solid white;' : '') + 'height: ' + times[time].modified * (85 / max.count) + 'px;"></span>';  
        times_h += '<span data-hint="' + times[time].removed + ' removed" ' + ((!times[time].removed) ? 'style="border:none !important;"' : '') + ' class="removed_h hint--right hint--error" style="height: ' + times[time].removed * (85 / max.count) + 'px;"></span>';      
        document.getElementById('timeline').innerHTML += '<div class="time-' + time.replace('.', 'p') + '" style="left: ' + time * 61 + 'px;">' + times_h + '</div>';
    }
    
}

var setTimelineSeconds = function (s) {
    var v = START_TIME;
    for (var i = 0; i <= s; i++) {
        var left = (i) ? ((i * 61) - (4 * i.toString().length)) : i;
        document.querySelectorAll('.seconds-list')[0].innerHTML += '<span style="left: ' + left + 'px;">' + v + 's</span>';
        v++;
    }
    document.getElementById('timeline').style.width = (s + 1) * 61 + 'px';
}

var setTimeline = function(timeline) {
    setNumberChanges(timeline);
    setChanges(timeline);
    setTimelineSeconds(TIMELINE_SECONDS);
}

var filterChanges = function(timeline, type) {
    setNumberChanges(timeline);
    $('.acc-tr').each(function(i) {
        var time = parseFloat($(this).data('time'));
        if($('#filter-changes').css('display') == 'none' || (time >= $('#filter-changes').find('.from').val() && time <= $('#filter-changes').find('.to').val())) {
            $(this).removeClass('hide-change').addClass('show-change');
        } else {
            $(this).removeClass('show-change').addClass('hide-change');
        }
    });
    $(".accordion-changes").animate({ scrollTop: $('.show-change').first().data('id') *  44}, ((type == 'resize' || type == 'draggable') ? 0 : 500));
}

var levChanged = function(type) {
    if (parseInt(document.getElementById('lev').style.width) > 0) {
        $('#lev').css('border-width', '2px');
        $('#filter-changes').show();
        $('#filter-changes').find('.from').val(($('.lev').position().left / 61).toFixed(2));
        $('#filter-changes').find('.to').val((($('.lev').position().left + parseInt(document.getElementById('lev').style.width)) / 61).toFixed(2));        
    } else {
        $('#lev').css('border-width', '1px');
        $('#filter-changes').hide();
    }
    filterChanges(timeline, type);
}

var escapeHtml = function (str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\//g, "&#x2F;");
}

var validate = function (evt) {
  var theEvent = evt || window.event;
  var key = theEvent.keyCode || theEvent.which;
  key = String.fromCharCode( key );
  var regex = /[0-9]|\./;
  if( !regex.test(key) ) {
    theEvent.returnValue = false;
    if(theEvent.preventDefault) theEvent.preventDefault();
  }
}

var countStatus = function (status, timeline) {
    var count = 0;
    for (var i = 0, len = timeline.length; i < len; i++) {
        if (timeline[i].status == status) {
            if($('#filter-changes').css('display') == 'none' || (timeline[i].time >= $('#filter-changes').find('.from').val() && timeline[i].time <= $('#filter-changes').find('.to').val())) {
                count++;
            }
        }
    }
    return count;
}

var timeline = [
        {element: '<div>', time: 0.2, status: 'added', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<div>', time: 0.2, status: 'added', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<div>', time: 0.2, status: 'added', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<div>', time: 0.2, status: 'added', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<div>', time: 0.2, status: 'added', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},        
        {element: '<div>', time: 1.5, status: 'added', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<span>', time: 1.5, status: 'added', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<div>', time: 3.5, status: 'added', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<div>', time: 3.5, status: 'added', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<div>', time: 5, status: 'added', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<span>', time: 1.5, status: 'removed', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<ul>', time: 7, status: 'removed', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<span>', time: 1.5, status: 'removed', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<p>', time: 3.5, status: 'removed', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<p>', time: 3, status: 'removed', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<p>', time: 3, status: 'removed', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<div>', time: 1.5, status: 'modified', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<div>', time: 3, status: 'modified', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<span>', time: 7, status: 'modified', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<p>', time: 5, status: 'modified', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<p>', time: 6, status: 'modified', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<p>', time: 6.5, status: 'modified', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<div>', time: 1.5, status: 'modified', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<div>', time: 3, status: 'modified', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<span>', time: 5, status: 'modified', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<p>', time: 5, status: 'modified', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<p>', time: 6, status: 'modified', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]},
        {element: '<p>', time: 6.5, status: 'modified', details: [{name: 'prop1', value: 'value for prop1'}, {name: 'prop2', value: 'value for prop2'}]}
];

setTimeline(timeline);

var selectable = function() {
    $('#timeline').selectable({
        stop: function(e) {
            if (e.toElement.id == 'offsetW') {
                var selectXW = (e.offsetX < 0) ? 0 : e.offsetX;
                $('.lev').css({
                width: (selectXW > selectX) ? selectXW - selectX : selectX - selectXW,
                left: (selectXW > selectX) ? selectX : selectXW, 
                });
                levChanged('selectable');
            }
            $('#offsetW').hide();
        },
        start: function(e, ui) {
            $('#offsetW').show();
            selectX = e.offsetX;
        },
        filter: '.noselectee',
    });
}

var selectX;

selectable();

$('#filter-changes input').bind('keypress', function(e) {
  var toVal = $('#filter-changes .to').val();
  var fromVal = $('#filter-changes .from').val();
	if(e.keyCode==13 && !(toVal < 0 || fromVal < 0 || toVal > TIMELINE_SECONDS || fromVal > TIMELINE_SECONDS)){
        $('#lev').css({left: ($('#filter-changes .from').val() * 61), width: ($('#filter-changes .to').val() * 61) - ($('#filter-changes .from').val() * 61)});
        levChanged();
	}
});

$('#node-changes input').on('keyup', function () {
    var value = this.value;
    $('.accordion-changes .acc-tr').hide().each(function () {
        if ($(this).text().search(value) > -1) {
            $(this).show();
        }
    });
});

$( ".lev" ).draggable({
    axis: 'x',
    containment: 'parent',
    handle: '.drag-lev',
    drag: function(e) {
        levChanged('draggable');
    }
});

var x,y,top,left,down;

$(".seconds-list").mousedown(function(e){
    e.preventDefault();
    down=true;
    x=e.pageX;
    y=e.pageY;
    top=$("#wrapper-timeline").scrollTop();
    left=$("#wrapper-timeline").scrollLeft();
});

$("body").mousemove(function(e){
    if(down){
        var newX=e.pageX;
        var newY=e.pageY;
                
        $("#wrapper-timeline").scrollTop(top-newY+y);    
        $("#wrapper-timeline").scrollLeft(left-newX+x);    
    }
});

$("body").mouseup(function(e){down=false;});

$("#colorblind").change(function() {
    if(!this.checked) {
        $('#dom-recorder').removeClass('colorblind-on').addClass('colorblind-off');
    } else {
        $('#dom-recorder').removeClass('colorblind-off').addClass('colorblind-on');
    }
});

$('#filter-changes').find('a').click(function(e) {
     e.preventDefault();
     $('#lev').css('width', '0px');
     levChanged('reset');
});

var element = document.getElementById('lev');

var resizerE = document.getElementsByClassName('lev2')[0];
resizerE.addEventListener('mousedown', initResizeE, false);

function initResizeE(e) {
   $( "#timeline" ).selectable('destroy');
   window.addEventListener('mousemove', ResizeE, false);
   window.addEventListener('mouseup', stopResizeE, false);
}

function ResizeE(e) {
    levChanged('resize');
   element.style.width = ((e.clientX - $('#timeline').offset().left) - $('.lev').position().left) + 'px';
}

function stopResizeE(e) {
    selectable();
    window.removeEventListener('mousemove', ResizeE, false);
    window.removeEventListener('mouseup', stopResizeE, false);
}

var baseX;
var baseW;
var resizerW = document.getElementsByClassName('lev1')[0];
resizerW.addEventListener('mousedown', initResizeW, false);

function initResizeW(e) {
    $( "#timeline" ).selectable('destroy');
    baseX = e.clientX - $('#timeline').offset().left;
    baseW = parseInt(element.style.width);
   window.addEventListener('mousemove', ResizeW, false);
   window.addEventListener('mouseup', stopResizeW, false);
}

function ResizeW(e) {
    levChanged('resize');
   if (baseX < (e.clientX - $('#timeline').offset().left)) {
       element.style.width = (baseW - ((e.clientX - $('#timeline').offset().left - baseX))) + 'px';
   } else {
       element.style.width = (baseW + (baseX - (e.clientX - $('#timeline').offset().left))) + 'px';   
   }
   
   if(e.clientX - $('#timeline').offset().left < 0) {
       element.style.left = '0px';
   } else {
       element.style.left = ((e.clientX - $('#timeline').offset().left)) + 'px';   
   }
}

function stopResizeW(e) {
    selectable();
    window.removeEventListener('mousemove', ResizeW, false);
    window.removeEventListener('mouseup', stopResizeW, false);
}