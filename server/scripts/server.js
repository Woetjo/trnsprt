// require
var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var request = require('request');
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var Promise = require('promise');

// vars
var port = process.argv[2] || 8888;
var requestSettings = {
	method: 'GET',
	url: 'http://gtfs.openov.nl/gtfs-rt/vehiclePositions.pb',
	encoding: null
};
var aantal = 0;

// functions
var getData = function() {
	return new Promise(function (resolve, reject) {
		request(requestSettings, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var feed = GtfsRealtimeBindings.FeedMessage.decode(body);
				var result = [];
				feed.entity.forEach(function (entity) {
					// if (entity.id.substring(11, 16) === 'QBUZZ') {
					if (entity.vehicle.trip.route_id == 6757) {
						result.push(entity);
					}
					// }
				});
				if (result.length) {
					resolve(result);
				} else {
					reject({});
				}
			} else {
				reject(error);
			}
		});
	});
}



// **********************************************************************
// create express app
var app = express();

// hmm, is dit nodig?
app.use(cors());

// parse application/json
app.use(bodyParser.json());

// Serve client during development
app.use(express.static('../../client/app'));

// Set logger middleware
app.use(function (req, res, next) {
	// console.log(strftime('%B %d, %Y %H:%M:%S') + ' ' + req.method + ' request to ' + req.path);
	next();
});

// custom routes
app.get('/api/getdata', function (request, response) {
	getData()
		.then(function(data) {
			response.writeHead(200, {"Content-Type": "application/json"});
			response.end(JSON.stringify(data));
	});

});

// start server
app.listen(port, function () {
	console.log('Server started, listening on port ' + port);
});
