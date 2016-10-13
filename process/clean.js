var fs = require('fs');
var makeDir = fs.mkdirSync;
var spawn = require('child_process').spawn;

spawn('rm', ['-rf', 'result']);
spawn('rm', ['-rf', 'fail.json']);
spawn('rm', ['-rf', 'result.json']);
makeDir('result');