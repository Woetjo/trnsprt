(function() {
	'use strict';

	angular.module('busMap', [
		'busMap.core',
		'busMap.overview',
		'busMap.kiesbus',
		'busMap.menu',
		'busMap.backend',
		'busMap.thirdparty',
		'ui.bootstrap'

	])

		.value('global', {
			runOnce: false
		});

})();



