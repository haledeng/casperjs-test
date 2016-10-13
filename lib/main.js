/**
 * 1. https: //github.com/sheebz/phantom-proxy
 */
var child_process = require('child_process');
var spawn = child_process.spawn;
var colors = require('colors');
var Link = require('./links').create();
var spider = require('./spider');
var Capture = require('./capture');

// 最多开10个子进程
var MAX_PROCESS = 5;


module.exports = exports = create;

function create() {
	return new App();
}

// 主进程
function App() {
	this.maxChildProcess = MAX_PROCESS;
	this.childProcessCount = 0;
}

App.prototype.init = function(url) {
	Link.addLink(url);
	this.runResourceServer()
		.startNewChildProcess();
	var urls = Link.getLink(this.maxChildProcess);
	this.snapUrls(urls);
};


App.prototype.startNewChildProcess = function() {
	this.childProcessCount--;
	var urls = Link.getLink(this.maxChildProcess - this.count);
	if (urls.length) {
		this.snapUrls(urls);
	} else {
		process.exit();
	}
	return this;
};

App.prototype.runResourceServer = function() {
	spawn('node', ['process/http.js']);
	return this;
};


App.prototype._processListener = function(capture) {
	var self = this;
	var proc = capture.proc;
	proc.stdout.on('data', function(data) {
		console.log(colors.green(data));
		if (/Error/.test(data)) {
			self.startNewChildProcess();
		}
	});
	proc.stderr.on('data', function(data) {
		console.log(colors.red.underline(data));
	});
	proc.on('exit', function(state) {
		console.log(colors.white('finish process url: ' + capture.url));
		console.log(colors.white('================================================'));
		self.startNewChildProcess();
	});
}


App.prototype.snapUrls = function(urls) {
	var self = this;
	urls.forEach(function(url) {
		spider.getUrls(url.url, url.deep);
		var capture = new Capture({
			url: url.url
		});
		self._processListener(capture);
	});
};