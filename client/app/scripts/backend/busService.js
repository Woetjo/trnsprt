(function() {
	'use strict';

	angular.module('busMap.backend')
		.factory('busService', busService);

	/* @ngInject */
	function busService($resource, config) {
		return $resource(config.host + '/api/getdata')
	}

})();

