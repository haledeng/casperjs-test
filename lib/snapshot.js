var casper = require('casper').create({
	logLevel: 'info',
	clientScripts: [
		'./injectJs/zhaopin.test.min.js'
	],
	pageSettings: {
		userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
		loadImages: false
	},
	viewportSize: {
		width: 375,
		height: 667
	}
});
var args = casper.cli.args;
var url = args[0];


function url2name(url) {
	return url.replace(/https?:\/\//i, '')
		.replace(/\//g, '-')
		.replace(/\?/g, '-')
		.replace(/\.s?html?/i, '');
}

function extractHost(url) {
	var reg = /^https?:\/\/([^\/]*)/;
	var matches = url.match(reg);
	if (matches) {
		var hostReg = /([^\.]*)\.(com|cn|net|org|cc)(\.cn)?$/;
		var mat = matches[1].match(hostReg);
		return mat ? mat[0] : matches[1];
	}
	return '';
}

function savePic(url) {
	var host = extractHost(url);
	casper.start(url, function() {
		this.waitForSelector('#z_p', (function() {
			this.capture('./snapshot/' + (host ? host + '/' : '') + 'success/' + url2name(url) + '.png');
			this.echo('xinxinliu insert success');
			this.exit(0);
		}), (function() {
			this.emit('xinxi:fail');
			this.capture('./snapshot/' + (host ? host + '/' : '') + 'fail/' + url2name(url) + '.png');
			this.die("Timeout reached. Or not found");
			this.exit(1);
		}), 15e3);
	});
	casper.run();
}

if (url && /^http:\/\//.test(url)) {
	savePic(url);
}