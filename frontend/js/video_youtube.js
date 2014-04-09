$('document').ready(function() {
	if( !device.tablet() && !device.mobile() ) {
		
		var options = { videoId: 'kn-1D5z3-Cs', mute: true};
		$('#video').tubular(options);

} else {
	
	$('body').addClass('poster-image');
	
}

});


