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
//var chalk = require('chalk');

module.exports = function(url, config, output, options) {

    //console.log(chalk.grey('Opening URL: ', url));
    //console.log(chalk.grey('Inject script', config));
    //console.log(chalk.grey('Output directory: ', output));

    if (!url) {
        throw new Error("Missing URL parameter.");
    }

    if (!config) {
      throw new Error("Missing conf parameter.");
    }

    output = output || __dirname;
    options = options || {};

    //console.log(chalk.green('Creating page'));

    var ps = new events.EventEmitter();

    //console.log(ps);

    // Create Phantom and Page
    //ps.emit('willCreatePhantom'); // DOES NOT WORK: too late.

    phantom.create(function(ph) {

        ps.emit('didCreatePhantom', ph);

        ps.emit('willCreatePage');

        ph.createPage(function(page) {

            ps.emit('didCreatePage', page);

            // Apply options
            page.set('viewportSize', options.viewportSize);

            page.onConsoleMessage(function(msg) {
              //console.log(chalk.cyan('Console: ', msg));
              ps.emit('consoleMessage', msg);
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
              ps.emit('willQuit', ph, page);

              page.close();
              ph.exit();

              ps.emit('didQuit');
            });

            var emitContinue = function (name, successful) {
              //console.log(chalk.blue('emitContinue', name, successful));
              page.evaluate(function(a) {
                /* global pageshot */
                pageshot.continue(a.name, a.successful);
                return a;
              },
              function(){
                //console.log(chalk.blue('Continuing...'));
              },
              {
                name: name,
                successful: successful
              });
            };

            eventEmitter.on('shoot', function(options) {
              ps.emit('willShoot', options);

              var p = path.resolve(output, options.name+'.'+options.format);
              //console.log(chalk.blue(p));
              page.render(p, {format: options.format, quality: options.quality}, function() {
                //console.log(chalk.green('Done shooting!'));

                ps.emit('didShoot', options, true);

                emitContinue(options.name, true);
              });
            });

            ps.emit('willOpenPage');

            return page.open(url, function(status) {
                // Check for page load success
                ps.emit('didOpenPage', status);

                if (status !== "success") {
                    //console.log(chalk.red("Unable to access network"));
                    throw new Error('Unable to access URL, "'+url+'".');
                } else {
                    //console.log('Success!');
                    var p = path.resolve(__dirname, 'pageshot-browser.js');
                    //console.log(p);
                    ps.emit('willInjectPageshot', p);
                    page.injectJs(p, function(success) {
                      //console.log(success);
                      ps.emit('didInjectPageshot', success);
                      if (success) {
                        ps.emit('willInjectConfig', config);
                        page.injectJs(config, function(success) {
                          ps.emit('didInjectConfig', success);
                          //console.log(success);
                          if (success) {
                            
                          } else {
                            throw new Error('Failed to inject your custom configuration script from "'+config+'".');
                          }
                        });
                      } else {
                        throw new Error('Failed to inject Pageshot Browser script.');
                      }
                    });
                }
            });
        });
    });

    return ps;

};
