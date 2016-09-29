var links = [];
var index = 0;

// exclude
// .css, .js, .jpg, .png
function addLink(href, deep) {
	deep = deep || 1;
	var resourceRg = /\.(css|js|jpg|png|jpeg|php)$/;
	// @TODO: 这里需要过滤一下，不同的hash，querystring参数
	if (!resourceRg.test(href) && -1 === links.indexOf(href)) {
		// 外链
		links.push({
			url: href,
			deep: deep
		});
	}
}


function getLink(num) {
	num = num || 1;
	if (index >= links.length) return [];
	var results = links.slice(index, index + num);
	index += results.length;
	return results;
}


exports.addLink = addLink;
exports.getLink = getLink;