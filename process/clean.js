var fs = require('fs');
var spawn = require('child_process').spawn;

spawn('rm', ['-rf', 'snapshot']);
spawn('rm', ['-rf', 'fail.json']);