(function () {
	'use strict';

	angular.module('busMap.kiesbus')
		.controller('kiesbusController', kiesbusController);

	/* @ngInject */
	function kiesbusController(lodash, moment, $http, $location) {
		var vm = this;

		// vm
		vm.allLines =[];
		vm.lineLabel = lineLabel;
		vm.selectedLine;
		vm.kiesLijn = kiesLijn;
		allCompanies = {};
		vm.kiesVervoerder = kiesVervoerder;


		// vars
		var propName;
		var alleBussen = [];
		var allCompanies = {};

		var _ = lodash;

		// functions
		function kiesVervoerder(vervoerder) {
			console.log(vervoerder);
			vm.allLines = _.sortBy(allCompanies[vervoerder], function(bus) {
				return Number(bus.LinePublicNumber);
			});
		}
		function parseResponse(response) {

			for (var lijn in response) {
				propName = lijn.split('_');
				if (propName[0] === 'QBUZZ') {
					alleBussen.push(
						{
							id: lijn,
							LineName: response[lijn].LineName,
							LinePublicNumber: response[lijn].LinePublicNumber,
							LineDirection: response[lijn].LineDirection,
							DestinationName50: response[lijn].DestinationName50,
							TransportType: response[lijn].TransportType

						}
					)
				}



				if (allCompanies.hasOwnProperty(propName[0])) {
					allCompanies[propName[0]].push(
						{
							id: lijn,
							LineName: response[lijn].LineName,
							LinePublicNumber: response[lijn].LinePublicNumber,
							LineDirection: response[lijn].LineDirection,
							DestinationName50: response[lijn].DestinationName50,
							TransportType: response[lijn].TransportType

						}
					)
				} else {
					allCompanies[propName[0]] = [
						{
							id: lijn,
							LineName: response[lijn].LineName,
							LinePublicNumber: response[lijn].LinePublicNumber,
							LineDirection: response[lijn].LineDirection,
							DestinationName50: response[lijn].DestinationName50,
							TransportType: response[lijn].TransportType

						}
					]
				}
			}
			vm.allCompanies = allCompanies;

		}

		function handleError(error) {
			console.log(error);
		}

		function lineLabel(lijn) {
			return '(' + lijn.TransportType + ') Lijn ' + lijn.LinePublicNumber + ' ' + lijn.LineName + ' naar ' +  lijn.DestinationName50;
		}

		function kiesLijn(lijn) {
			$location.path('/overview').search('id', lijn)
		}


		// init
		(function () {
			moment.locale("nl");
			$http({
				method: 'GET',
				url: 'http://v0.ovapi.nl/line/'
			})
				.success(parseResponse)
				.error(handleError);
		}());
	}
})();
