var low = require('lowdb');
var path = require('path');
var RESULT_DIR = path.join(__dirname, '../result');
var RESULT_DIR_JSON = path.join(RESULT_DIR, 'result.json');
var db = low(RESULT_DIR_JSON);
var _ = require('./util');


exports.write = function(obj) {
	var url = obj.url;
	var host = _.extractHost(url).replace(/\./g, '-');
	if (!db.has(host).value()) {
		db.set(host, {}).value();
	}
	var stateDbMaps = {
		0: 'success',
		1: 'fail',
		2: 'diff'
	};
	var subDb = host + '.' + stateDbMaps[obj.state];
	if (!db.has(subDb).value()) {
		db.set(subDb, []).value();
	}

	var set = db.get(subDb).value();
	if (-1 === set.indexOf(url)) {
		db.get(subDb).push(url).value();
	}
};