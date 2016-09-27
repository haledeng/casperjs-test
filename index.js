/**
 * 1. 无线网络掉线
 * 2. https://github.com/sheebz/phantom-proxy
 * 3. eventEmmiter
 *
 * @todo :
 * 1. 信息流插入成功report
 * 2. 失败report，统计（不展示的原因）
 */
var child_process = require('child_process');
var fs = require('fs');
var spawn = child_process.spawn;
var colors = require('colors');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var Link = require('./lib/links');
var spider = require('./lib/spider');
var low = require('lowdb');
var db = low('fail.json');
var sizeOf = require('image-size');
var func = require('./lib/func');
// 最多开10个子进程
var MAX_PROCESS = 5;
// 当前子进程个数
var count = 0;

// 控制线程池
function createSnapProcess(url) {
	count++;
	var snapshot = spawn('casperjs', ['lib/snapshot.js', url]);
	snapshot.stdout.on('data', function(data) {
		console.log(colors.green(data));
		if (/Error/.test(data)) {
			recordFail(url);
			eventEmitter.emit('process:end');
			count--;
		}
	});

	snapshot.stderr.on('data', function(data) {
		console.log(colors.red.underline('stderr:' + data));
	});
	snapshot.on('exit', function(state) {
		// resemble timeout
		// insert fail
		if (state === 3 || state === 1) {
			recordFail(url);
		} else if (state === 2) {
			// insert success, shown uncorrectly.
			recordDiff(url);
		}
		// process image file, image size
		var path = func.getPath(url);
		if (fs.existsSync(path)) {
			var imgInfo = sizeOf(path);
			if (imgInfo.width === 375 && imgInfo.height === 220) {
				// 正确的图片
			}
		}
		eventEmitter.emit('process:end');
		count--;
		console.log(colors.green('finish process url: ' + url));
	});
}

// 插入成功，显示异常
function recordDiff(url) {
	recordFail(url, 'diff');
}

// 插入失败
function recordFail(url, name) {
	var host = name || func.extractHost(url).replace(/\./g, '-');
	if (!db.has(host).value()) {
		db.set(host, []).value();
	}

	var set = db.get(host).value();
	if (-1 === set.indexOf(url)) {
		db.get(host).push(url).value();
	}
}


function snapUrls(urls, isSpider) {
	isSpider = typeof isSpider === 'undefined' ? true : isSpider;
	urls.forEach(function(url) {
		isSpider && spider.getUrls(url.url, url.deep);
		createSnapProcess(url.url);
	});
}

// 子进程处理完毕后，新开子进程
eventEmitter.on('process:end', function() {
	// create new process
	var urls = Link.getLink(MAX_PROCESS - count);
	if (urls.length) {
		snapUrls(urls, true);
	}
});

// Link.addLink('http://m.autohome.com.cn');
Link.addLink('http://m.2345.com/websitesNavigation.htm');
var url = Link.getLink(MAX_PROCESS);
snapUrls(url);