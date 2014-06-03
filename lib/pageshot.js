/*
 * pageshot
 * https://github.com/Glavin001/pageshot
 *
 * Copyright (c) 2014 Glavin Wiechert
 * Licensed under the MIT license.
 */

'use strict';

// Dependencies
var phantom = require('phantom');
var events = require('events');
var path = require('path');

module.exports = function(url, output) {

    console.log('Opening URL: ', url);
    console.log('Output directory: ', output);

    if (!url) {
        throw new Error("Missing URL parameter.");
    }

    // Create page
    phantom.create(function(ph) {
        ph.createPage(function(page) {

            var eventEmitter = new events.EventEmitter();

            eventEmitter.on('quit', function() {
              page.close();
              ph.exit();
              process.exit(0);
            });

            eventEmitter.on('shoot', function(options) {
              var p = path.resolve(output, options.name+'.'+options.format);
              console.log(p);
              page.render(p, {format: options.format, quality: options.quality}, function() {
                console.log('Done shooting!');
              });
            });

            page.onConsoleMessage(function(msg) {
              //console.log('Console: ', msg);

              // Check if Pageshot request
              var suffix = 'Pageshot:';
              var rx = new RegExp('^'+suffix);
              if (rx.test(msg)) {
                  // Is a Pageshot request
                  var str = msg.substring(suffix.length);
                  var obj = JSON.parse(str);
                  eventEmitter.emit(obj.action, obj.options);
              }

            });

            return page.open(url, function(status) {
                // Check for page load success
                //console.log('Status: ', status);
                if (status !== "success") {
                    console.log("Unable to access network");
                } else {
                    console.log('Success!');
                    var p = path.resolve(__dirname, 'pageshot-browser.js');
                    console.log(p);
                    page.injectJs(p, function(success) {
                      console.log(success);
                      if (success) {

                      }
                    });
                }
            });
        });
    });

};
