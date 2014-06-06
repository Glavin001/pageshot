#!/usr/bin/env node
'use strict';

var program = require('commander');
var pageshot = require('./lib/pageshot');
var pkg = require('./package.json');
var chalk = require('chalk');

// CLI arguments
program
  .version(pkg.version)
  .usage('--url <url> --conf <path> --output <dir>')
  .option('--url <url>', 'open URL')
  .option('--conf <path>', 'inject configuration script.')
  .option('--output <dir>', 'output directory')
  .option('--width <pixels>', 'viewportSize width in pixels.')
  .option('--height <pixels>', 'viewportSize height in pixels.')
  .parse(process.argv);

var options = {
  viewportSize: {
    width: program.width || 480,
    height: program.height || 800
  }
};

// Start Pageshot
var p = pageshot(program.url, program.conf, program.output, options);

// Print out live events
p.on('didShoot', function(options, successful) {
  var title = '"' + options.name + '.' + options.format + '" with ' + options.quality + ' quality.';

  if (successful) {
    console.log(chalk.green('\n✔ ' + 'Successfully generated '+title));
  } else {
    console.log(chalk.red('\n✘ ' + 'Failed to generate '+title));
  }
});
p.on('didQuit', function() {
  process.exit(0);
});
