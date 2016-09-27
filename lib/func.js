// 多端共用
var isNode = true;
var isBrowser = false;
if (typeof global === 'object' && typeof window === 'undefined') {
	// nodeJs
} else if (typeof window === 'object') {
	// browser
	isBrowser = true;
	isNode = false;
}


function url2name(url) {
	return url.replace(/https?:\/\//i, '')
		.replace(/\//g, '-')
		.replace(/\?/g, '-')
		.replace(/#/g, '-')
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
		ret[pic] = '/snapshot/' + (host ? host + '/' : '') + pic + '/' + name + '.png';
	});
	return ret;
}

if (isBrowser) {
	window._testTool_ = {
		url2name: url2name,
		extractHost: extractHost
	};
} else if (isNode) {
	exports.url2name = url2name;
	exports.extractHost = extractHost;
	exports.getPath = getPath;
}