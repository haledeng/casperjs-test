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
var spawn = child_process.spawn;
var colors = require('colors');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var Link = require('./lib/links');
var spider = require('./lib/spider');

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
			eventEmitter.emit('process:end');
			count--;
		}
	});

	snapshot.stderr.on('data', function(data) {
		console.log(colors.red.underline('stderr:' + data));
	});
	snapshot.on('exit', function() {
		eventEmitter.emit('process:end');
		count--;
		console.log(colors.green('finish process url: ' + url));
	});
}



function snapUrls(urls, isSpider) {
	isSpider = typeof isSpider === 'undefined' ? true : isSpider;
	urls.forEach(function(url) {
		isSpider && spider.getUrls(url);
		createSnapProcess(url);
	});
}

// 子进程处理完毕后，新开子进程
eventEmitter.on('process:end', function() {
	// create new process
	var urls = Link.getLink(MAX_PROCESS - count);
	if (urls.length) {
		snapUrls(urls, false);
	}
});

Link.addLink('http://m.2345.com/websitesNavigation.htm');
var url = Link.getLink(MAX_PROCESS);
snapUrls(url);