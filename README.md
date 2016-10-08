# casperjs-test
A automatic test for DOM inserting.

### Requirement
+ [Nodejs](https://nodejs.org/en/)
+ [phantomjs](http://phantomjs.org/)
+ [python](https://www.python.org/)
+ [casperjs](http://docs.casperjs.org/en/latest/index.html)

**On win32 platform, the install path should be added into global environment path.**

### Install
Execute the following order in command line.
```
npm i
```

### How to run
Put you test JS files into somewhere. Change the config option `clientScripts` in `lib/snapshot.js` to your JS file path. And in line 40 in `lib/snapshot.js`, you can test your DOM operation. The `waitForSelector` function will polling page to look up your
added DOM selector.


Config Host: 'www.test.com' => `127.0.0.1`

Execute the following command:
```
npm start
```

A snapshot picture will be saved in `snapshot` directory, whether your DOM inserting action success or fail.