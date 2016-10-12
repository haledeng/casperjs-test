// require local module
var require = patchRequire(require);
var fs = require('fs');
// absolute path
var path = fs.absolute(fs.workingDirectory + '/lib/func.js');
var func = require(path);
var casper = require('casper').create({
	logLevel: 'info',
	clientScripts: [
		'./injectJs/zhaopin.test.min.js',
		'./injectJs/resemble.js',
		'./lib/func.js',
		'./injectJs/tools.js'
	],
	pageSettings: {
		userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
		// resemble加载image，这里必须配置成true
		loadImages: true
	},
	viewportSize: {
		width: 375,
		height: 667
	}
});


// 浏览器执行
function comparePic() {
	// 本地静态资源服务器对应域名，需要配置host
	var picHost = 'http://www.test.com';
	var href = location.href;
	var host = window._testTool_.extractHost(href);
	var _filePath = picHost + window._testTool_.getPath(href).success;
	// canvas.toDataURL跨域问题
	// Access-Control-Allow-Origin: '*'
	// content-security-policy
	resemble(picHost + '/resource/base.png')
		.compareTo(_filePath)
		.ignoreColors()
		.onComplete(function(data) {
			if (Number(data.misMatchPercentage) > 50) {
				window._tool_.render(data.getImageDataUrl());
			}
			window._hasImage_ = true;
			window._diffData_ = data;
		});
}

// 发送结果到本地server，写记录
var sendResult = function(state) {
	casper.evaluate(function(t) {
		window._tool_.sendResult(t);
	}, state);
};


// 插入成功回调
function addInsertListener() {
	casper.on('insert:success', function(filePath, realUrl) {
		var host = func.extractHost(realUrl);
		casper.evaluate(comparePic);
		// 等待浏览器执行
		casper.waitFor(function() {
			return casper.evaluate(function() {
				return window._hasImage_;
			});
		}, function() {
			var diff = casper.evaluate(function() {
				return window._diffData_;
			});
			if (!diff || 'undefined' === typeof diff.misMatchPercentage) {
				sendResult(1);
				casper.echo('request image fail.');
				casper.exit(4);
			} else {
				casper.echo(diff.misMatchPercentage);
				if (Number(diff.misMatchPercentage) > 50) {
					casper.echo('different picture');
					sendResult(2);
					casper.captureSelector('./snapshot/diff/' + (host ? host + '/' : '') + func.url2name(url) + '.png', '#image-diff');
					casper.exit(2);
				} else {
					sendResult(0);
					casper.echo('same picture');
					casper.exit(0);
				}
			}
		}, function() {
			send.fail();
			casper.echo('Timeout....');
			casper.exit(3);
		}, 6e4);
	});
}

// 加载测试脚本，执行case
function executeTest(url) {
	casper.start(url);
	// exit state
	// 0: success
	// 1: insert fail
	// 2: insert success, diff snapshot
	// 3: resemble timeout
	casper.then(function() {
		// 302 redirect
		var realUrl = casper.getCurrentUrl();
		var filePath = func.getPath(realUrl);
		this.waitForSelector('#z_p', (function() {
			this.echo('xinxiliu insert success');
			this.captureSelector('.' + filePath.success, '#z_p');
			this.emit('insert:success', filePath, realUrl);
		}), (function() {
			send.fail();
			this.capture('.' + filePath.fail);
			this.die("Timeout reached. Or xinxiliu insert fail");
			this.exit(1);
		}), 2e4);
	});
	casper.run();
}

function init() {
	var args = casper.cli.args;
	var url = args[0];
	if (url && /^http:\/\//.test(url)) {
		addInsertListener();
		executeTest(url);
	}
}

init();