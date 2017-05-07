(function() {
	'use strict';

	angular.module('busMap.backend')
		.factory('lijnService', lijnService);

	/* @ngInject */
	function lijnService($resource, config) {
		// return $resource('http://v0.ovapi.nl/line/QBUZZ_g509_1')
		return $resource('http://v0.ovapi.nl/line/:request')
	}

})();

