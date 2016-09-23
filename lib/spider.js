var cheerio = require('cheerio');
var superagent = require('superagent');
var fs = require('fs');
var Link = require('./links');
// 黑名单内URL直接pass
var blackList = [/(cnzz|baidu|baidustatic|taobao)\.com/];

function inBlack(url) {
	var reg = /https?:\/\/([^\/]*)/;
	var matches = url.match(reg);
	if (matches) {
		var host = matches[1];
		blackList.forEach(function(item) {
			if (item.test(host)) {
				return true;
			}
		});
		return false;
	}
	return false;
}

function getUrls(url) {
	superagent.get(url)
		.end(function(err, res) {
			if (err || !res.text) {
				console.log(err);
				return;
			}
			var $ = cheerio.load(res.text);
			var ret = [];
			$('a[href]').each(function(idx, elem) {
				var $this = $(elem);
				var href = $this.attr('href');
				if (/^http:\/\//.test(href) && !inBlack(href)) {
					Link.addLink(href);
					ret.push(href);
				}
			});
		})
}

exports.getUrls = getUrls;