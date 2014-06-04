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
var chalk = require('chalk');

module.exports = function(url, config, output) {

    console.log(chalk.grey('Opening URL: ', url));
    console.log(chalk.grey('Inject script', config));
    console.log(chalk.grey('Output directory: ', output));

    if (!url) {
        throw new Error(chalk.red("Missing URL parameter."));
    }

    if (!config) {
      throw new Error(chalk.red("Missing conf parameter."));
    }

    output = output || __dirname;

    // Create page
    phantom.create(function(ph) {
        ph.createPage(function(page) {

            page.onConsoleMessage(function(msg) {
              console.log(chalk.cyan('Console: ', msg));
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

            var eventEmitter = new events.EventEmitter();

            eventEmitter.on('quit', function() {
              page.close();
              ph.exit();
              process.exit(0);
            });

            var emitContinue = function (name, successful) {
              console.log(chalk.blue('emitContinue', name, successful));
              page.evaluate(function(a) {
                /* global pageshot */
                pageshot.continue(a.name, a.successful);
                return a;
              },
              function(a){
                console.log(chalk.blue('Continuing...', a));
              },
              {
                name: name,
                successful: successful
              });
            };

            eventEmitter.on('shoot', function(options) {
              var p = path.resolve(output, options.name+'.'+options.format);
              console.log(chalk.blue(p));
              page.render(p, {format: options.format, quality: options.quality}, function() {
                console.log(chalk.green('Done shooting!'));
                emitContinue(options.name, true);
              });
            });


            return page.open(url, function(status) {
                // Check for page load success
                //console.log('Status: ', status);
                if (status !== "success") {
                    console.log(chalk.red("Unable to access network"));
                } else {
                    console.log('Success!');
                    var p = path.resolve(__dirname, 'pageshot-browser.js');
                    console.log(p);
                    page.injectJs(p, function(success) {
                      console.log(success);
                      if (success) {
                        page.injectJs(config, function(success) {
                          console.log(success);
                        });
                      }
                    });
                }
            });
        });
    });

};
