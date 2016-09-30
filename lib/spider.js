/**
 * @todo
 * 1. 策略控制，相同URL（类似，参数不同）
 * 2. 内存控制，1个页面对应了N个链接，URL队列暴涨，导致数组操作性能问题
 */
var cheerio = require('cheerio');
var superagent = require('superagent');
var fs = require('fs');
var Link = require('./links').create();
// 黑名单内URL直接pass
var blackList = [/(cnzz|baidu|baidustatic|taobao)\.com/];

// 爬虫最大深度
var MAX_DEEP = 2;

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

function getUrls(url, deep) {
	if (deep >= MAX_DEEP) return;
	superagent.get(url)
		.end(function(err, res) {
			if (err || !res.text) {
				err && console.log(err);
				return;
			}
			var $ = cheerio.load(res.text);
			var ret = [];
			$('a[href]').each(function(idx, elem) {
				var $this = $(elem);
				var href = $this.attr('href');
				if (/^http:\/\//.test(href) && !inBlack(href)) {
					Link.addLink(href, deep + 1);
					ret.push(href);
				}
			});
		})
}

exports.getUrls = getUrls;