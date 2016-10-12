var low = require('lowdb');
var db = low('result.json');
var $ = require('./func');


exports.write = function(obj) {
	var url = obj.url;
	var host = $.extractHost(url).replace(/\./g, '-');
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