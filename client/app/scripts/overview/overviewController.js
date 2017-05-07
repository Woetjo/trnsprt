(function () {
	'use strict';

	angular.module('busMap.overview')
		.controller('overviewController', overviewController);

	/* @ngInject */
	function overviewController(NgMap, $interval, $rootScope, $location, global, config, message, tpcService, lijnService, lodash, moment, $anchorScroll, $routeParams, $timeout) {
		var vm = this;
		var _ = lodash;
		moment.locale("nl");

		vm.showMap = true;
		vm.allBuses = [];
		vm.accumulatedBusstops = [];
		vm.journeys = [];
		vm.centerMapOn = centerMapOn;
		vm.getJourney = getJourney;
		vm.selectedJourney = {};
		// vm.selectedJourneyNumber;
		vm.busLabel = busLabel;
		vm.timerValue = 0;
		vm.intervalValue = config.interval / 1000;
		vm.centerMapOnBus = false;
		vm.doCenterOnBus = doCenterOnBus;
		vm.changeCenterOnBus = changeCenterOnBus;
		vm.goToKiesBus = goToKiesBus;

		var markerArray = [];
		var interval = config.interval;
		var defaultCenter = config.defaultCenter;
		var busIcon =
		{
			url: config.busIcon, // url
			scaledSize: new google.maps.Size(30, 30), // scaled size
			origin: new google.maps.Point(0, 0), // origin
			anchor: new google.maps.Point(15, 15) // anchor
		};
		var boatIcon =
		{
			url: config.boatIcon, // url
			scaledSize: new google.maps.Size(30, 30), // scaled size
			origin: new google.maps.Point(0, 0), // origin
			anchor: new google.maps.Point(15, 15) // anchor
		};
		var metroIcon =
		{
			url: config.metroIcon, // url
			scaledSize: new google.maps.Size(30, 30), // scaled size
			origin: new google.maps.Point(0, 0), // origin
			anchor: new google.maps.Point(15, 15) // anchor
		};
		var tramIcon =
		{
			url: config.tramIcon, // url
			scaledSize: new google.maps.Size(30, 30), // scaled size
			origin: new google.maps.Point(0, 0), // origin
			anchor: new google.maps.Point(15, 15) // anchor
		};

		var busStopIcon =
		{
			url: config.busStopIcon, // url
			scaledSize: new google.maps.Size(15, 15), // scaled size
			origin: new google.maps.Point(0, 0), // origin
			anchor: new google.maps.Point(7, 7) // anchor
		};

		var _createMarker;
		var _drawBusesOnMap;
		var _map;
		var _busLocation;
		var _icon = busIcon;


		init();

		function setIcon(type) {
			if (type === 'BUS') {
				_icon = busIcon;
			}
			if (type === 'BOAT') {
				_icon = boatIcon;
			}
			if (type === 'METRO') {
				_icon = metroIcon;
			}
			if (type === 'TRAM') {
				_icon = tramIcon;
			}
		}

		function goToKiesBus() {
			$location.path('/kies');
		}

		function changeCenterOnBus() {
			if (vm.centerMapOnBus) {
				centerMapOn(_busLocation);
			}
		}

		function doCenterOnBus() {
			centerMapOn(_busLocation);
		}

		function clearAllMarkers() {
			for (var i = 0; i < markerArray.length; i++) {
				if (markerArray[i].marker) {
					markerArray[i].marker.setMap(null);
				}
			}
			markerArray = [];
		}

		function startProgressBar() {
			var teller = 1;
			vm.timerValue = 0;

			var stopProgressBar = $interval(function () {
				vm.timerValue = teller;
				teller++;
				if (teller >= 8) {
					stopProgressBar();
				}
			}, 1000);
		}

		function busLabel(bus) {
			var label = (bus.IsTimingStop ? 'Inactief' : '* Actief') + ' - Lijn ' + bus.LinePublicNumber + ' (' + bus.JourneyNumber + ') ' + moment(bus.ExpectedDepartureTime).format('LT');
			return label;
		}

		function updateSelectedJourney() {
			var selectedJourney = vm.selectedJourney;
			var currentBus = getBusByJourneyNumber(vm.selectedJourneyNumber);
			var activeAnchor;
			for (var journey in selectedJourney) {
				var currentJourney = selectedJourney[journey];
				currentJourney.TargetArrivalTime = '';
				if (currentBus.TimingPointCode === currentJourney.TimingPointCode) {
					currentJourney.TargetArrivalTime = moment(currentBus.TargetArrivalTime).format('LT');
					activeAnchor = currentJourney.UserStopOrderNumber;
					$('#timetable').scrollTo('#anchor' + activeAnchor, 2000, {offset: -70});


				}
			}
		}

		function convertObjectToArray(myObject) {
			return $.map(myObject, function (value, index) {
				return [value];
			});
		}

		function getJourneyByNumber(journeyNumber) {
			return _.find(vm.allBuses, {'JourneyNumber': journeyNumber})
		}

		function getBusByJourneyNumber(journeyNumber) {
			return _.find(vm.allBuses, {'JourneyNumber': journeyNumber})
		}

		function getJourney(journeyNumber) {
			clearAllMarkers();
			var journeyCode = getJourneyByNumber(journeyNumber).JourneyPatternCode;
			vm.selectedJourney = vm.allJourneys[journeyCode];
			// getAllTimepointCodesForJourney(vm.selectedJourney);
			drawBusstopsOnMap(vm.selectedJourney);
			_drawBusesOnMap();
			updateSelectedJourney();
			$timeout(function () {
				centerMapOn(_busLocation);
			}, 350)

		}

		function getAllTimepointCodesForJourney(journey) {
			var requestString = '';
			for (var stop in journey) {
				requestString = requestString + journey[stop].TimingPointCode + ',';

			}
			tpcService.get({requestString: requestString},
				function (response) {
					for (var stop in journey) {
						// journey[stop].TimingPointCode
						for (var tpc in response) {
							var breakOut = false;
							var passes = response[tpc].Passes;
							for (var pass in passes) {
								if (passes[pass].JourneyNumber === vm.selectedJourneyNumber) {
									vm.selectedJourney[stop].TargetArrivalTime = passes[pass].TargetArrivalTime;
									breakOut = true;
									break;
								}
							}
							if (breakOut) {
								break;
							}
						}

					}


				},
				function (error) {

				})

		}

		function drawBusstopsOnMap(accumulatedBusstops) {
			accumulatedBusstops = convertObjectToArray(accumulatedBusstops);
			var uniqueAccumulatedBusstops = _.uniq(accumulatedBusstops, function (stop) {
				return '' + stop.Lattitude + stop.Longitude;
			});

			for (var i = 0; i < uniqueAccumulatedBusstops.length; i++) {
				_createMarker(uniqueAccumulatedBusstops[i].TimingPointName,
					{
						latitude: uniqueAccumulatedBusstops[i].Latitude,
						longitude: uniqueAccumulatedBusstops[i].Longitude
					},
					busStopIcon
				)
			}
		}

		function pad(num, size) {
			var s = num + "";
			while (s.length < size) {
				s = "0" + s;
			}
			return s;
		}

		function centerMapOn(location) {
			if (location && location.hasOwnProperty('latitude') && location.hasOwnProperty('longitude')) {
				_map.panTo(new google.maps.LatLng(location.latitude, location.longitude));
			}
		}

		function init() {
			NgMap.getMap({id: 'overviewMap'})
				.then(doTheThing)
				.catch(function (error) {
					message.error(JSON.stringify(error));
					console.log(error);
				});

			function doTheThing(map) {
				_map = map;
				_map.setOptions({
					options: {
						center: config.defaultCenter,
						zoom: 14,
						mapTypeId: google.maps.MapTypeId.TERRAIN,
						disableDefaultUI: true
					}

				});
				_map.panTo(new google.maps.LatLng(defaultCenter.lat, defaultCenter.lng));

				// start
				drawBusesOnMap();
				var drawInterval = $interval(function () {
					drawBusesOnMap();
				}, interval);

				function createMarker(title, pos, icon) {
					var marker;
					if (icon !== busStopIcon) {
						marker = new google.maps.Marker({
							map: _map,
							icon: icon,
							title: title,
							duration: 2000
						});
						// marker.setPositionNotAnimated(new google.maps.LatLng(pos.latitude,pos.longitude));
						marker.setPositionNotAnimated(pos.latitude,pos.longitude);
					} else {
						marker = new google.maps.Marker({
							position: new google.maps.LatLng(pos.latitude, pos.longitude),
							map: _map,
							icon: icon,
							title: title,
							duration: 0
						});
					}
					markerArray.push({
						id: title,
						marker: marker
					});
					return marker;
				}

				_createMarker = createMarker;

				function moveBusMarker(marker, pos) {
					marker.setPosition(new google.maps.LatLng(pos.latitude, pos.longitude));
				}

				function getMarkerById(id) {
					if (id) {
						for (var i = 0; i < markerArray.length; i++) {
							if (markerArray[i].id === id) {
								return markerArray[i].marker;
							}
						}
						// No marker found. We'll make one
						var marker = createMarker(id, {latitude: 0, longitude: 0}, _icon);
						markerArray.push({
							id: id,
							marker: marker
						});
						return marker;
					}
					return false;
				}

				function drawBusesOnMap() {
					var request = $routeParams.id || 'QBUZZ_g509_1'; // default QBUZZ lijn 9 Groningen
					lijnService.get({request: request},
						function (response) {
							// startProgressBar();
							var kyz = Object.keys(response);
							setIcon(response[kyz[0]].Line.TransportType);
							var actuals = response[kyz[0]].Actuals;
							var allJourneys = response[kyz[0]].Network;
							message.info('Updating data, waiting ' + config.interval / 1000 + ' seconds.');
							// map allBuses to array
							vm.allBuses = _.sortBy(convertObjectToArray(actuals), 'ExpectedDepartureTime');
							if (!vm.allBuses.length) {
								vm.showMap = false;
							}
							vm.allJourneys = allJourneys;

							var bus = getBusByJourneyNumber(vm.selectedJourneyNumber);
							if (bus) {
								var busMarker = getMarkerById('' + bus.JourneyNumber);
								var busLocation = {
									latitude: bus.Latitude,
									longitude: bus.Longitude
								};
								_busLocation = busLocation;
								moveBusMarker(busMarker, busLocation);
								if (vm.centerMapOnBus) {
									centerMapOn(busLocation);
								}
							}
							updateSelectedJourney();
						},
						function (error) {
							message.error('Error contacting lijnService');
							console.log('Error contacting lijnService');
							console.log(error);
						}
					)
				}

				_drawBusesOnMap = drawBusesOnMap;


				// We'll need to destroy the interval when the route changes
				$rootScope.$on("$routeChangeStart", function (event, next, current) {
					if (angular.isDefined(drawInterval)) {
						$interval.cancel(drawInterval);
						drawInterval = undefined;
					}

					// remove all markers
					clearAllMarkers();
				});

			}

		}

	}
})();
