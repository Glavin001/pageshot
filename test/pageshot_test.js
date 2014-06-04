'use strict';

var pageshot = require('../lib/pageshot.js');
var express = require('express');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.pageshot = {
  setUp: function(done) {
    //console.log('\n');
    //console.log('setUp');
    // setup here
    var app = express();
    app.use(express.static(__dirname));
    var server = app.listen(3000);
    //console.log('Listening on port 3000');
    this.server = server;
    done();
  },
  tearDown: function(done) {
    //console.log('tearDown');
    var server = this.server;
    server.close();
    done();
  },
  'no args': function(test) {
    test.expect(1);
    // tests here
    test.throws(pageshot);
    test.done();
  },
  'index.html': function(test) {
    test.expect(6);
    // tests here
    var p = pageshot("http://localhost:3000/index.html","test/index.js","temp/");
    p.on('didShoot', function(options, successful) {
      test.ok(successful, 'Did Shoot');
    });
    p.on('didQuit', function() {
      test.done();
    });
  },
  'advanced events': function(test) {
    test.expect(7);
    // tests here
    var p = pageshot("http://localhost:3000/index.html","test/index.js","temp/");
    /*
    p.on('willCreatePhantom', function() {
      test.ok(true, 'Will create Phantom.');
    });
    */
    p.on('didCreatePhantom', function(ph) {
      test.ok(!!ph, 'Did create Phantom.');
    });
    p.on('willCreatePage', function() {
      test.ok(true, 'Will create Page.');
    });
    p.on('didCreatePage', function(page) {
      test.ok(!!page, 'Did create page.');
    });
    p.on('willOpenPage', function() {
      test.ok(true, 'Will open Page.');
    });
    p.on('didOpenPage', function(status) {
      test.ok(status==='success', 'Did open page.');
    });
    p.on('willQuit', function() {
      test.ok(true, 'Will quit.');
    });
    p.on('didQuit', function() {
      test.ok(true, 'Did quit.');
      test.done();
    });
  }

};
