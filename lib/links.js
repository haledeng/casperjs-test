var Link = function(opts) {
	if (!(this instanceof Link)) {
		return new Link(opts);
	}
}

Link.links = [];
Link.index = 0;

var _proto_ = Link.prototype;

_proto_.addLink = function(href, deep) {
	deep = deep || 1;
	var resourceRg = /\.(css|js|jpg|png|jpeg|php)$/;
	if (!resourceRg.test(href) && -1 === Link.links.indexOf(href)) {
		// 外链
		Link.links.push({
			url: href,
			deep: deep
		});
	}
};


_proto_.getLink = function(num) {
	num = num || 1;
	if (Link.index >= Link.links.length) return [];
	var results = Link.links.slice(Link.index, Link.index + num);
	Link.index += results.length;
	return results;
}


exports.create = function(opts) {
	return new Link(opts);
}