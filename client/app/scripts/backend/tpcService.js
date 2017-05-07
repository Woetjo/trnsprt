(function() {
	'use strict';

	angular.module('busMap.backend')
		.factory('tpcService', tpcService);

	/* @ngInject */
	function tpcService($resource, config) {
		return $resource('http://v0.ovapi.nl/tpc/:requestString')
	}

})();

