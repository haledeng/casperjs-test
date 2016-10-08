// require local module
var require = patchRequire(require);
var fs = require('fs');
// 复用func.js 必须引用绝对路径
var path = fs.absolute(fs.workingDirectory + '/lib/func.js');
var func = require(path);
var casper = require('casper').create({
	logLevel: 'info',
	clientScripts: [
		'./injectJs/zhaopin.test.min.js',
		'./injectJs/resemble.js',
		'./lib/func.js'
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
var args = casper.cli.args;
var url = args[0];

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
	resemble(picHost + '/injectJs/base.png')
		.compareTo(_filePath)
		.ignoreColors()
		.onComplete(function(data) {
			if (Number(data.misMatchPercentage) > 50) {
				render(data);
			}
			window._hasImage_ = true;
			window._diffData_ = data;

			function render(data) {
				var div = document.createElement('div');
				div.id = 'image-diff';
				var img = new Image();
				img.src = data.getImageDataUrl();
				div.appendChild(img);
				document.body.appendChild(div);
			}
		});
}


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
				// csp
				casper.echo('request image fail.');
				casper.exit(4);
			} else {
				casper.echo(diff.misMatchPercentage);
				if (Number(diff.misMatchPercentage) > 50) {
					casper.echo('different picture');
					casper.captureSelector('./snapshot/diff/' + (host ? host + '/' : '') + func.url2name(url) + '.png', '#image-diff');
					casper.exit(2);
				} else {
					casper.echo('same picture');
					casper.exit(0);
				}
			}
		}, function() {
			casper.echo('Timeout....');
			casper.exit(3);
		}, 60000);
	});
}

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
			this.capture('.' + filePath.fail);
			this.die("Timeout reached. Or xinxiliu insert fail");
			this.exit(1);
		}), 15e3);
	});
	casper.run();
}

if (url && /^http:\/\//.test(url)) {
	addInsertListener();
	executeTest(url);
}