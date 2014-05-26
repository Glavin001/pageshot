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
    console.log('\n');
    console.log('setUp');
    // setup here
    var app = express();
    app.use(express.static(__dirname));
    var server = app.listen(3000);
    console.log('Listening on port 3000');
    this.server = server;
    done();
  },
  tearDown: function(done) {
    console.log('tearDown');
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
    test.expect(1);
    // tests here
    pageshot("http://localhost:3000/");
    test.ok(true, 'Page successfully opened.');
    test.done();
  }
};
