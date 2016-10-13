var child_process = require('child_process');
var spawn = child_process.spawn;

var CAPTURE_PROCESS_DIR = 'process/snapshot.js';

function Capture(opts) {
	this.url = opts.url;
	this._init();
}

Capture.prototype._init = function() {
	this.proc = spawn('casperjs', [CAPTURE_PROCESS_DIR, this.url]);
};

module.exports = Capture;