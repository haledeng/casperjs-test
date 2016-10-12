(function(
	exports) {
	function render(src) {
		var div = document.createElement('div');
		div.id = 'image-diff';
		var img = new Image();
		img.src = src;
		div.appendChild(img);
		document.body.appendChild(div);
	}

	function sendRequest(param) {
		var url = 'http://www.test.com';
		var arr = [];
		Object.keys(param).forEach(function(key) {
			arr.push(key + '=' + encodeURIComponent(param[key]));
		});
		url = url + '?' + arr.join('&');
		new Image().src = url;
	}


	exports.render = render;
	exports.sendRequest = sendRequest;
	exports.sendResult = function(state) {
		var param = {
			url: location.href,
			state: state
		};
		sendRequest(param);
	}

})(window._tool_ || (window._tool_ = {}));