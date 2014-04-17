$(window).load(function() {
	"use strict";
    /* ==============================================
    PRELOADER
    =============================================== */
    var preloaderDelay = 800;
    var preloaderFadeOutTime = 1000;

    function hidePreloader() {
        var loadingAnimation = $('#loading-animation');
        var preloader = $('.main');

        loadingAnimation.fadeOut();
        preloader.delay(preloaderDelay).fadeOut(preloaderFadeOutTime, function() {
        	jQuery('.animate').waypoint(function() {
        	     var animation = jQuery(this).attr("data-animate");
        	     jQuery(this).addClass(animation);
        	     jQuery(this).addClass('animated');
        	}, { offset: '80%' }); 
         });
    }
    
    hidePreloader();
    
});

/* DOCUMENT READY  ----------- */
jQuery(document).ready(function() {
		
"use strict";	

	/* ==============================================
    SOCKET IO
    =============================================== */
    
	var socket = io.connect('http://ardnmtn.barthopster.nl:8181');
	
	socket.on('unauthorised', function (data) {
		$('.success-message-2').hide();
		$('.error-message-2').hide();
		$('.error-message-2').html('<div class="error-message-2">'+ data +'</div>');
		$('.error-message-2').fadeIn().delay(3000).fadeOut();
	});
	
	socket.on('authorised', function (data) {
		$('.error-message-2').hide();
        $('.success-message-2').hide();
        $('#contactform').fadeOut();
        $('#contactform input').val('');
        $('#contactform textarea').val('');
        
        var counter = 0;
        for (var property in data) {
			if (data[property] == true)
			{
				$('#light' + counter).html('<a class="thumbnail on"><img src="http://placehold.it/350x250&text=Light+' + (counter + 1) +  '" alt="" /><div><span id="light' + counter + 'spantext">Click to<br />turn off</span></div></a>');
			}
			else
			{
				$('#light' + counter).html('<a class="thumbnail off"><img src="http://placehold.it/350x250&text=Light+' + (counter + 1) +  '" alt="" /><div><span id="light' + counter + 'spantext">Click to<br />turn on</span></div></a>');
			}
			
			$('#light' + counter).bind('click', function(e) {
				e.preventDefault();
				$('#' + this.id + 'spantext').html('Processing...');
				
				var isOn = $(this).find('a').hasClass("on");
				socket.emit('lightcommand', { 'lightID' : this.id,
												   'on' : !isOn });
			});
			
			counter++;
        }
        
		$.scrollTo('#gallery', 750, {
	    	easing: 'easeInSine',
	    	axis: 'y',
	    	offset: -45
	    });
	});
	
	socket.on('accepted', function (data) {
		if (data['on'] == true)
		{
			$('#' + data['lightID']).find('a').attr("class", "thumbnail on");
			$('#' + data['lightID']).find('span').html('Click to<br />turn off');
		}
		else
		{
			$('#' + data['lightID']).find('a').attr("class", "thumbnail off");
			$('#' + data['lightID']).find('span').html('Click to<br />turn on');
		}
	});
	
	/* ==============================================
    SCROLL PAGE WITH EASING EFFECT
    =============================================== */
	
	$('.navbar-brand').bind('click', function(e) {
	    e.preventDefault();
	    var target = this.hash;
	    $.scrollTo(0, 1250, {
	    	easing: 'swing',
	    	axis: 'y'
	    });
	});
	
	$('.scroll-down').bind('click', function(e) {
	    e.preventDefault();
	    var target = this.hash;
	    $.scrollTo(target, 750, {
	    	easing: 'easeInSine',
	    	axis: 'y',
	    	offset: -45
	    });
	});
	
	$('.navbar-nav li a').bind('click', function(e) {
	    e.preventDefault();
	    var target = this.hash;
	    $.scrollTo(target, 1250, {
	    	easing: 'swing',
	    	axis: 'y',
	    	offset: -45
	    });
	});
	
	$('.back-top').bind('click', function(e) {
	    e.preventDefault();
	    var target = this.hash;
	    $.scrollTo(0, 1250, {
	    	easing: 'swing',
	    	axis: 'y'
	    });
	});
	
	/* ==============================================
    ACTIVE LINKS ON NAVIGATION BAR
    =============================================== */
	jQuery('body').scrollspy({ offset: 300,target: 'nav' })

	/* ==============================================
    TESTIMONIALS SLIDER
    =============================================== */
	var owl = $("#testimonials-slides");
	owl.owlCarousel({
		navigation : true, // Show next and prev buttons
		slideSpeed : 600,
		paginationSpeed : 800,
		singleItem:true,
		items : 1,
		navigationText : ["<span class='testimonial-icon' aria-hidden='true' data-icon='&#x3c;'></span>", "<span class='testimonial-icon' aria-hidden='true' data-icon='&#x3d;'></span>"],
		pagination : false
	});

	/* ==============================================
	/*	SUSCRIPTION FORM
	=============================================== */
    $('.success-message').hide();
    $('.error-message').hide();

    $('.subscribe form').submit(function() {
        var postdata = $('.subscribe form').serialize();
        $.ajax({
            type: 'POST',
            url: 'php/sendmail.php',
            data: postdata,
            dataType: 'json',
            success: function(json) {
                if(json.valid == 0) {
                    $('.success-message').hide();
                    $('.error-message').hide();
                    $('.error-message').html(json.message);
                    $('.error-message').fadeIn().delay(3000).fadeOut();
                }
                else {
                    $('.success-message').hide();
                    $('.error-message').hide();
                    $('.subscribe form').hide().delay(3000).fadeIn();
                    $('.subscribe form input').val('');
                    $('.success-message').html(json.message);
                    $('.success-message').fadeIn().delay(2000).fadeOut();
                }
            }
        });
        return false;
    });
    
    /* ==============================================
    /* MAGNIFIC POPUP FOR PORTFOLIO
	================================================== */
	$('.portfolio-popup').magnificPopup({
		type: 'image',
		removalDelay: 500, //delay removal by X to allow out-animation
		callbacks: {
		beforeOpen: function() {
			   this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
			   this.st.mainClass = 'mfp-zoom-in';
			}
		},
		closeOnContentClick: true,
		fixedContentPos: false
	});
	
	/* ==============================================
    /* GALLERY HOVER
	================================================== */
	$('.gallery-images > div ').each( function() { $(this).hoverdir(); } );
	
	/* ==============================================
    /* LOAD THE ANIMATIONS IF THE BROWSER IS NOT IE
	================================================== */	
	if( !device.tablet() && !device.mobile() ) { //Load the animations if the device is not a mobile or tablet
		$('head').append('<!--[if !IE]><!--><link rel="stylesheet" type="text/css" media="screen" href="css/animate.css"><!--<![endif]-->');
	}
	
	/* ==============================================
    /* CONTACT FORM
	================================================== */
	
    $('.success-message-2').hide();
    $('.error-message-2').hide();
		
	$('#contactform').submit(function(){
		var credentials = $(this).serialize();
		socket.emit('login', credentials);
		return false;
	});			

}); /* END DOCUMENT READY  ----------- */


/* FUNCTIONS  ----------- */

/* scroll down navigation  ----------- */

jQuery(function() {
		var bar = jQuery('nav');
		var top = bar.css('top');
		var ww = jQuery(window).width();
		var navigationHeight = -jQuery('.collapse').height();
		var mobileTop = Math.floor(navigationHeight - 60);
		
		jQuery(window).scroll(function() {
				if(jQuery(this).scrollTop() > 310) {
						bar.stop().animate({top : '0'}, 300);
				} else {
						if(ww < 768) {
								bar.stop().animate({top : mobileTop}, 600);
						} else {
								bar.stop().animate({top : top}, 300);
						}
				}  
		});
});