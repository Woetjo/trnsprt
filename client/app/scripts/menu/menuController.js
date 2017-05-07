(function() {
	'use strict';

	angular.module('busMap.menu')
		.controller('menuController', menuController);

	/* @ngInject */
	function menuController($location) {
		var vm = this;

		vm.activeRoute = activeRoute;

		function activeRoute() {
			return $location.path();
		}
	}

})();
