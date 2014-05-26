#!/usr/bin/env node
'use strict';

var program = require('commander');
var pageshot = require('./lib/pageshot');
var pkg = require('./package.json');

program
  .version(pkg.version)
  .option('--url <url>', 'Open URL')
  .option('--output <dir>', 'Output directory')
  .parse(process.argv);

pageshot(program.url, program.output, function() {
    process.exit(0);
});
