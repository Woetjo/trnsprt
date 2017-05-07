(function() {
	'use strict';

	angular.module('busMap.thirdparty')
		.factory('moment', momentService);

	/* @ngInject */
	function momentService() {
		return moment;
	}

})();

