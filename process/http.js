// 本地静态服务器
var http = require('http');
var fs = require('fs');
var path = require('path');
var types = require('../lib/minitype').types;
var log = require('../lib/log');


var resourceServer = function(req, res) {
	var url = req.url;
	var filePath = path.join('./', url);
	var ext = path.extname(url);
	ext = ext.replace('.', '');
	var contentType = types[ext] || 'text/plain';
	if (!fs.existsSync(filePath)) {
		res.writeHeader(404, {
			'Content-Type': contentType
		});
		res.end("This request URL " + url + " was not found on this server.");
	} else {
		fs.readFile(filePath, 'binary', function(err, data) {
			if (err) {
				res.writeHeader(500, {
					'Content-Type': contentType
				});
				res.end(err);
			} else {
				res.writeHeader(200, {
					'Content-Type': contentType,
					'Access-Control-Allow-Origin': '*'
				});
				res.write(data, 'binary');
				res.end();
			}
		});
	}
};

// 回写图片对比的结果
function writeResult(req, res) {
	var params = require('url').parse(req.url, true).query || {};
	log.write(params);
	res.writeHeader(200);
	res.end();
}


var server = http.createServer(function(req, res) {
	var ext = path.extname(req.url);
	ext = ext.replace('.', '');

	if (~['js', 'png', 'jpeg', 'jpg', 'css', 'svg'].indexOf(ext)) {
		resourceServer(req, res);
	} else {
		writeResult(req, res);
	}
});
server.listen(80);