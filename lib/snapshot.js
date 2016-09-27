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

var require = patchRequire(require);
var fs = require('fs');
// 复用func.js 必须引用绝对路径
var path = fs.absolute(fs.workingDirectory + '/lib/func.js');
var func = require(path);

var url = args[0];

function savePic(url) {

	casper.start(url);
	// exit status
	// 0: success
	// 1: insert fail
	// 2: insert success, diff snapshot
	// 3: resemble timeout
	casper.then(function() {
		// 302 redirect
		var realUrl = casper.getCurrentUrl();
		var host = func.extractHost(realUrl);
		this.waitForSelector('#z_p', (function() {
			var filePath = '.' + func.getPath(realUrl).success;
			this.captureSelector(filePath, '#z_p');
			casper.evaluate(function() {
				var href = location.href;
				var host = window._testTool_.extractHost(href);
				var _filePath = 'http://www.test.com' + window._testTool_.getPath(href).success;
				// @TODO: server代理获取本地图片, fiddler代理
				// resemble 不允许跨域
				// canvas.toDataURL跨域问题
				// 设置fiddler响应头: Access-Control-Allow-Origin: '*'
				// @TODO: _filePath图片可能没加载到，路径的原因
				// 设置不显示图片，排除图片diff
				resemble('http://www.test.com/injectJs/base.png')
					.compareTo(_filePath)
					.ignoreColors()
					.onComplete(function(data) {
						// CSP protocol
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
			});

			casper.waitFor(function() {
				return casper.evaluate(function() {
					return window._hasImage_;
				});
			}, function() {
				var diff = casper.evaluate(function() {
					return window._diffData_;
				});
				casper.echo(diff.misMatchPercentage)
					// different snapshot
				if (Number(diff.misMatchPercentage) > 50) {
					casper.echo('different picture');
					casper.captureSelector('./snapshot/diff/' + (host ? host + '/' : '') + func.url2name(url) + '.png', '#image-diff');
					casper.exit(2);
				} else {
					// same picture
					casper.echo('same picture');
					casper.exit(0);
				}
			}, function() {
				casper.echo('Timeout....');
				casper.exit(3);
			}, 60000);
			casper.echo('xinxinliu insert success');
		}), (function() {
			casper.capture('./snapshot/' + (host ? host + '/' : '') + 'fail/' + func.url2name(realUrl) + '.png');
			casper.die("Timeout reached. Or not found");
			casper.exit(1);
		}), 15e3);
	})
	casper.run();
}

if (url && /^http:\/\//.test(url)) {
	savePic(url);
}