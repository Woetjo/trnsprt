(function() {
	'use strict';

	angular
		.module('busMap.core')
		.factory('message', message);

	function message() {
		return {
			clear: function() {
				toastr.clear();
			},
			success: function (text) {
				toastr.success(text);
			},
			error: function (text) {
				toastr.error(text);
			},
			info: function(text) {
				toastr.info(text);
			},
			warning: function(text) {
				toastr.warning(text);
			},
			options: function(options) {
				if (options) {
					toastr.options = options;
				}
			}

		};

	}
})();
