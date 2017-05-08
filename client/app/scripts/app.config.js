(function() {
	'use strict';

	angular
		.module('busMap')
		.value('config', {
			host: 'http://localhost:8888',
			interval: 10 * 1000,
			defaultCenter: {
				lat: 53.2236971,
				lng: 6.5518852
			},
			busIcon: 'images/bus2.png',
			boatIcon: 'images/boat.png',
			metroIcon: 'images/metro.png',
			tramIcon: 'images/tram.png',
			busStopIcon: 'images/bus-stop.png'
		})

	.config(configure);

	function configure() {
		toastr.options = {
			"closeButton": false,
			"debug": false,
			"newestOnTop": false,
			"progressBar": false,
			"positionClass": "toast-top-right",
			"preventDuplicates": true,
			"onclick": null,
			"showDuration": "300",
			"hideDuration": "1000",
			"timeOut": "3000",
			"extendedTimeOut": "1000",
			"showEasing": "swing",
			"hideEasing": "linear",
			"showMethod": "fadeIn",
			"hideMethod": "fadeOut"
		}
	}

})();

