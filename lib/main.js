/**
 * 1. https: //github.com/sheebz/phantom-proxy
 */
var child_process = require('child_process');
var spawn = child_process.spawn;
var fs = require('fs');
var colors = require('colors');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var Link = require('./links').create();
var spider = require('./spider');
var low = require('lowdb');
var db = low('fail.json');
var func = require('./func');
// 最多开10个子进程
var MAX_PROCESS = 5;


module.exports = exports = create;

function create() {
	return new App();
}


function SnapProcess(url) {
	this.url = url;
	this.init();
}

// casper子进程
SnapProcess.prototype.init = function(url) {
	var self = this;
	this.childPro = spawn('casperjs', ['process/snapshot.js', self.url]);
	this.log().error().exit();
};

SnapProcess.prototype.log = function() {
	this.childPro.stdout.on('data', function(data) {
		console.log(colors.green(data));
		if (/Error/.test(data)) {
			eventEmitter.emit('process:end', url, 1);
		}
	});
	return this;
};

SnapProcess.prototype.error = function() {
	this.childPro.stderr.on('data', function(data) {
		console.log(colors.red.underline('stderr:' + data));
	});
	return this;
};


SnapProcess.prototype.exit = function() {
	var self = this;
	this.childPro.on('exit', function(state) {
		eventEmitter.emit('process:end', self.url, state);
		console.log(colors.green('finish process url: ' + self.url));
	});
	return this;
};


// 主进程
function App() {
	this.maxChildProcess = MAX_PROCESS;
	this.childProcessCount = 0;
}

App.prototype.init = function(url) {
	this.runResourceServer()
		.startNewChildProcess();
	Link.addLink(url);
	var url = Link.getLink(this.maxChildProcess);
	this.snapUrls(url);
};


App.prototype.startNewChildProcess = function() {
	var self = this;
	// 子进程处理完毕后，新开子进程
	eventEmitter.on('process:end', function(url, state) {
		// if (state === 3 || state === 1) {
		// 	self.recordFail(url);
		// } else if (state === 2) {
		// 	// insert success, shown uncorrectly.
		// 	self.recordDiff(url);
		// }
		self.childProcessCount--;
		var urls = Link.getLink(self.maxChildProcess - self.count);
		if (urls.length) {
			self.snapUrls(urls, true);
		} else {
			process.exit();
		}
	});
	return this;
};


// App.prototype.recordFail = function(url, name) {
// 	var host = name || func.extractHost(url).replace(/\./g, '-');
// 	if (!db.has(host).value()) {
// 		db.set(host, []).value();
// 	}

// 	var set = db.get(host).value();
// 	if (-1 === set.indexOf(url)) {
// 		db.get(host).push(url).value();
// 	}
// };

// App.prototype.recordDiff = function(url) {
// 	this.recordFail(url, 'diff');
// };

App.prototype.runResourceServer = function() {
	spawn('node', ['process/http.js']);
	return this;
};



App.prototype.snapUrls = function(urls, isSpider) {
	isSpider = typeof isSpider === 'undefined' ? true : isSpider;
	urls.forEach(function(url) {
		isSpider && spider.getUrls(url.url, url.deep);
		new SnapProcess(url.url);
	});
};