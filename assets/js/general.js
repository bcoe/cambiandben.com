jQuery(document).ready(function($) {

// Smooth Scrolling of ID anchors	
  function filterPath(string) {
  return string
    .replace(/^\//,'')
    .replace(/(index|default).[a-zA-Z]{3,4}$/,'')
    .replace(/\/$/,'');
  }
  var locationPath = filterPath(location.pathname);
  var scrollElem = scrollableElement('html', 'body');
 
  $('a[href*=#].anchor').each(function() {
    $(this).click(function(event) {
    var thisPath = filterPath(this.pathname) || locationPath;
    if (  locationPath == thisPath
    && (location.hostname == this.hostname || !this.hostname)
    && this.hash.replace(/#/,'') ) {
      var $target = $(this.hash), target = this.hash;
      if (target && $target.length != 0) {
        var targetOffset = $target.offset().top;
          event.preventDefault();
          $(scrollElem).animate({scrollTop: targetOffset}, 400, function() {
            location.hash = target;
          });
      }
    }
   });	
  });
 
  // use the first element that is "scrollable"
  function scrollableElement(els) {
    for (var i = 0, argLength = arguments.length; i <argLength; i++) {
      var el = arguments[i],
          $scrollElement = $(el);
      if ($scrollElement.scrollTop()> 0) {
        return el;
      } else {
        $scrollElement.scrollTop(1);
        var isScrollable = $scrollElement.scrollTop()> 0;
        $scrollElement.scrollTop(0);
        if (isScrollable) {
          return el;
        }
      }
    }
    return [];
  }
  
// Remove links outline in IE 7
	$("a").attr("hideFocus", "true").css("outline", "none");

// style Select, Radio, Checkboxe
	if ($("select").hasClass("select_styled")) {
		cuSel({changedEl: ".select_styled", visRows: 7});
	}
	if ($("div,p").hasClass("input_styled")) {
		$(".input_styled input").customInput();
	}
	
// resonsive 			
	var screenRes = $(window).width();   
	if (screenRes > 600) {
		$(".slide-item .frame_box:nth-child(3n)").addClass("omega");
	}	
		
	$(".dropdown ul").parent("li").addClass("parent");
	$(".dropdown li:first-child").addClass("first");
	$(".dropdown li:last-child").addClass("last");
	$(".dropdown li:only-child").removeClass("last").addClass("only");	
	
	$(".dropdown li").hover(function(){
		var dropDown = $(this).children("ul");
		var ulWidth = dropDown.width();
		var liWidth = $(this).width();
		var posLeft = (liWidth - ulWidth)/2;
		dropDown.css("left",posLeft);		
	});	
	
// cols
	$(".row .col:first-child").addClass("alpha");
	$(".row .col:last-child").addClass("omega"); 
	
// preload images plugin
/*  v1.4 https://github.com/farinspace/jquery.imgpreload */
if("undefined"!=typeof jQuery){(function(a){a.imgpreload=function(b,c){c=a.extend({},a.fn.imgpreload.defaults,c instanceof Function?{all:c}:c);if("string"==typeof b){b=new Array(b)}var d=new Array;a.each(b,function(e,f){var g=new Image;var h=f;var i=g;if("string"!=typeof f){h=a(f).attr("src");i=f}a(g).bind("load error",function(e){d.push(i);a.data(i,"loaded","error"==e.type?false:true);if(c.each instanceof Function){c.each.call(i)}if(d.length>=b.length&&c.all instanceof Function){c.all.call(d)}a(this).unbind("load error")});g.src=h})};a.fn.imgpreload=function(b){a.imgpreload(this,b);return this};a.fn.imgpreload.defaults={each:null,all:null}})(jQuery)}

	$.imgpreload([
	'/wedding/PurpleOrange/images/dropdown_sprite.png',
	'/wedding/PurpleOrange/images/dropdown_sprite2.png',
	'/wedding/PurpleOrange/images/corner_big.png',
	'/wedding/PurpleOrange/images/corner_mid.png',
	'/wedding/PurpleOrange/images/corner_small.png'
	]);

	

// Topmenu <ul> replace to <select>
    $(function() {
        var $ = jQuery;
        var tempMenu = jQuery('#topmenu').clone();
        var mainNavigationMenu = jQuery('<div>');

        mainNavigationMenu.attr('id', 'topmenu-select');

        /* Replace unordered list with a "select" element to be populated with options, and create a variable to select our new empty option menu */
        mainNavigationMenu.html('<select class="select_styled" id="topm-select"></select>');
        jQuery('#topmenu').after(mainNavigationMenu);

        var selectMenu = mainNavigationMenu.children('select');

        /* Navigate our nav clone for information needed to populate options */
        jQuery(tempMenu).children('ul').children('li').each(function() {
            /* Get top-level link and text */
            var href = jQuery(this).children('a').attr('href');
            var text = jQuery(this).children('a').text();

            /* Append this option to our "select" */
            if (jQuery(this).is(".current-menu-item") && href != '#') {
                jQuery(selectMenu).append('<option value="'+href+'" selected>'+text+'</option>');
            } else if ( href == '#' ) {
                jQuery(selectMenu).append('<option value="'+href+'" disabled="disabled">'+text+'</option>');
            } else {
                jQuery(selectMenu).append('<option value="'+href+'">'+text+'</option>');
            }

            /* Check for "children" and navigate for more options if they exist */
            if (jQuery(this).children('ul').length > 0) {
                jQuery(this).children('ul').children('li').not(".mega-nav-widget").each(function() {

                    /* Get child-level link and text */
                    var href2 = jQuery(this).children('a').attr('href');
                    var text2 = jQuery(this).children('a').text();

                    /* Append this option to our "select" */
                    if (jQuery(this).is(".current-menu-item") && href2 != '#') {
                        jQuery(selectMenu).append('<option value="'+href2+'" selected> &nbsp;|-- '+text2+'</option>');
                    } else if ( href2 == '#' ) {
                        jQuery(selectMenu).append('<option value="'+href2+'" disabled="disabled"> &nbsp;|-- '+text2+'</option>');
                    } else {
                        jQuery(selectMenu).append('<option value="'+href2+'"> &nbsp;|-- '+text2+'</option>');
                    }

                    // if (jQuery(this).is(".current-menu-item")) {
                    // jQuery(selectMenu).append('<option value="'+href2+'" class="select-current" selected>'+text2+'</option>');
                    // } else {
                    // jQuery(selectMenu).append('<option value="'+href2+'"> &nbsp;|-- '+text2+'</option>');
                    // }

                    /* Check for "children" and navigate for more options if they exist */
                    if (jQuery(this).children('ul').length > 0) {
                        jQuery(this).children('ul').children('li').each(function() {

                            /* Get child-level link and text */
                            var href3 = jQuery(this).children('a').attr('href');
                            var text3 = jQuery(this).children('a').text();

                            /* Append this option to our "select" */
                            if (jQuery(this).is(".current-menu-item")) {
                                jQuery(selectMenu).append('<option value="'+href3+'" class="select-current" selected> &nbsp;&nbsp;&nbsp;&nbsp;|-- '+text3+'</option>');
                            } else {
                                jQuery(selectMenu).append('<option value="'+href3+'"> &nbsp;&nbsp;&nbsp;&nbsp;|-- '+text3+'</option>');
                            }

                        });
                    }

                });
            }

        });

        /* When our select menu is changed, change the window location to match the value of the selected option. */
        jQuery(selectMenu).change(function() {
            location = this.options[this.selectedIndex].value;
        });
    });

	// prettyPhoto lightbox, check if <a> has atrr data-rel and hide for Mobiles
	if($('a').is('[data-rel]') && screenRes > 600) {
        $('a[data-rel]').each(function() {
			$(this).attr('rel', $(this).data('rel'));
		});
		$("a[rel^='prettyPhoto']").prettyPhoto({social_tools:false});	
    }
	
});
