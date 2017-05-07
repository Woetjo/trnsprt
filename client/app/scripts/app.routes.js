(function () {
	'use strict';

	angular.module('busMap')
		.config(routes);

	/* @ngInject */
	function routes($routeProvider) {

		$routeProvider
			.when('/overview', {
				templateUrl: 'scripts/overview/overview.tpl.html',
				controller: 'overviewController',
				controllerAs: 'vm'
			})
			.when('/kies', {
				templateUrl: 'scripts/kiesBus/kiesBus.tpl.html',
				controller: 'kiesbusController',
				controllerAs: 'vm'
			})
			.otherwise({
				redirectTo: '/kies'
			})
	}

})();

