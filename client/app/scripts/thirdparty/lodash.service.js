(function() {
	'use strict';

	angular.module('busMap.thirdparty')
		.factory('lodash', lodashService);

	/* @ngInject */
	function lodashService() {
		return _;
	}

})();

