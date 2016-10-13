// 多端共用
var isNode = false;
var isBrowser = false;
var isCasper = false;
var RESULT_DIR = 'result';
// 兼容npm scripts
if (typeof process === 'object' /* && ~process.title.indexOf('node')*/ ) {
	isNode = true;
} else if (typeof window === 'object') {
	if (this === window) {
		isBrowser = true;
	} else {
		isCasper = true;
	}
}

function url2name(url) {
	return url.replace(/https?:\/\//i, '')
		.replace(/\//g, '-')
		.replace(/\?/g, '-')
		.replace(/#/g, '-')
		.replace(/&/g, '-')
		.replace(/\|/g, '-')
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

function getPath(url) {
	var host = extractHost(url);
	var name = url2name(url);
	var pics = ['success', 'fail', 'diff'];
	var ret = {};
	pics.forEach(function(pic) {
		ret[pic] = '/' + RESULT_DIR + '/' + (host ? host + '/' : '') + pic + '/' + name + '.png';
	});
	return ret;
}

if (isBrowser) {
	window._testTool_ = {
		url2name: url2name,
		extractHost: extractHost,
		getPath: getPath
	};
} else if (isNode || isCasper) {
	exports.url2name = url2name;
	exports.extractHost = extractHost;
	exports.getPath = getPath;
}