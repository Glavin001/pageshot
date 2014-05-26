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
var path = require('path');
/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */
var waitFor = function(testFx, onReady, intervalMillis, timeOutMillis) {
    //console.log('waitFor', arguments);

    intervalMillis = intervalMillis ? intervalMillis : 250;
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        //condition = false,
        interval = setInterval(function() {
            //console.log('Tick');
            testFx(function(condition) {
              //console.log('Condition:', condition);

              if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {
                  // If not time-out yet and condition not yet fulfilled
                  //console.log('timeOutMillis: ', timeOutMillis);
                  //condition = testFx(); //< defensive code
              } else {
                  if (!condition) {
                      // If condition still not fulfilled (timeout but condition is 'false')
                      //console.log("'waitFor()' timeout");
                      onReady(true);
                  } else {
                      // Condition fulfilled (timeout and/or condition is 'true')
                      //console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                      onReady(false); //< Do what it's supposed to do once the condition is fulfilled
                      clearInterval(interval); //< Stop this interval
                  }
              }
            });
        }, intervalMillis); //< repeat check every 250ms
};

module.exports = function(url, output, callback) {

    console.log('Opening URL: ', url);
    console.log('Output directory: ', output);

    if (!url) {
        throw new Error("Missing URL parameter.");
    }

    // Create page
    phantom.create(function(ph) {
        ph.createPage(function(page) {
            // Open URL
            //console.log('Page: ', page);

            page.set('onConsoleMessage', function(msg) {
              console.log('Console: ', msg);
            });

            return page.open(url, function(status) {
                // Check for page load success
                //console.log('Status: ', status);
                if (status !== "success") {
                    console.log("Unable to access network");
                } else {
                    console.log('Success!');
                    // Inject all of the code
                    page.evaluate(function() {
                        /* global window */
                        var pageshot = {
                            isReady: function() {
                                window.onPageshotReady();
                                return true;
                            },
                            _pendingShot: false,
                            _quit: false,
                            _timeout: 60 * 1000,
                            _interval: 100,
                            _name: 'Pageshot',
                            shoot: function(name) {
                                this._pendingShot = true;
                                this.setName(name);
                            },
                            cancel: function() {
                                this._pendingShot = false;
                            },
                            shouldShoot: function() {
                                return this._pendingShot;
                            },
                            quit: function() {
                                this._quit = true;
                            },
                            shouldQuit: function() {
                                return this._quit;
                            },
                            setInterval: function(i) {
                                this._interval = i;
                            },
                            setTimeout: function(i) {
                                this._timeout = i;
                            },
                            getInterval: function() {
                                return this._interval;
                            },
                            getTimeout: function() {
                                return this._timeout;
                            },
                            setName: function(name) {
                                this._name = name;
                            },
                            getName: function() {
                                return this._name;
                            }
                        };
                        window.pageshot = pageshot;
                        return window.pageshot.isReady();
                    }, function(success) {

                        var completionCallback = function() {
                            console.log('Close PhantomJS');
                            // Close page
                            page.close();
                            // Quit phantom
                            ph.exit();

                            //
                            callback();
                        };

                        if (success) {
                            console.log('Successful.');
                            /* jshint loopfunc: true */
                            //var continuing = true;
                            /*
                            var interval = page.evaluate(function() {
                                console.log(JSON.stringify(window.pageshot));
                                return window.pageshot._interval;
                            });
                            var timeout = page.evaluate(function() {
                                console.log(JSON.stringify(window.pageshot));
                                return window.pageshot._timeout;
                            });
                            */
                            var interval = 1000/60;
                            var timeout = 60*1000;

                            var runloop = function() {
                              // Wait for test condition to be true
                              waitFor(function(callback) {
                                  console.log('waitFor');
                                  // Check in the page if a specific element is now visible
                                  return page.evaluate(function() {
                                    /*
                                      return window.pageshot.shouldShoot() ||
                                          window.pageshot.shouldQuit();
                                    */
                                    return  window.pageshot._pendingShot ||
                                            window.pageshot._quit;
                                  }, function(result) {
                                      callback(result);
                                  });
                              }, function(timeout) {
                                  // After evaluation
                                  console.log('Screenshot?');
                                  if (timeout) {
                                      console.error('Timed out.');
                                  }
                                  // Check if should quit
                                  page.evaluate(function() {
                                      return window.pageshot._quit;
                                  }, function(quitting) {
                                    if (quitting) {
                                        completionCallback();
                                    }
                                    else {
                                      // Check if should take picture
                                      page.evaluate(function() {
                                          return window.pageshot._pendingShot;
                                      }, function(shooting) {
                                        // Reset
                                        var reset = function () {
                                          page.evaluate(function() {
                                              window.pageshot._pendingShot = false;
                                          }, function() {
                                              setTimeout(runloop, 1);
                                          });
                                        };

                                        //
                                        if (shooting) {
                                            console.log("TAKE PICTURE!");
                                            var p = path.resolve(output, (new Date())+'.pdf');
                                            console.log(p);
                                            page.render(p, {}, function() {
                                                console.log(arguments);
                                                reset();
                                            });
                                        } else {
                                            console.log("Don't take a picture yet.");
                                            reset();
                                        }
                                      });
                                    }
                                  });
                              }, interval, timeout);
                            };
                            setTimeout(runloop, 1);

                        } else {
                            console.log('Unsuccessful.');
                            completionCallback();
                        }

                    });

                }
            });
        });
    });

};
