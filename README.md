# [Pageshot](https://github.com/Glavin001/pageshot) [![Build Status](https://secure.travis-ci.org/Glavin001/pageshot.png?branch=master)](http://travis-ci.org/Glavin001/pageshot)

> Take screenshots triggered by browser-side JavaScript.

## Getting Started

Install the module with: `npm install -g pageshot`

## Documentation

### CLI

```bash
npm install -g pageshot
```

```bash
 pageshot --help

  Usage: pageshot --url <url> --conf <path> --output <dir>

  Options:

    -h, --help      output usage information
    -V, --version   output the version number
    --url <url>     open URL
    --conf <path>   inject configuration script.
    --output <dir>  output directory
```

### Developer API

```bash
npm install --save-dev pageshot
```

## Examples

See [test/](test/) directory

## Contributing

Clone and run the following demo:

### Start Simply HTTP Server

```bash
cd temp/
python -m SimpleHTTPServer
```

### Try out the CLI for yourself

```bash
./cli.js --url http://localhost:8000/index.html --conf test/index.js --output temp/
```

Now look in your `temp/` directory and see all of the generated screenshots.

## Release History

- 0.1.0 - First working version for CLI and developer API with complete Unit Tests.

## License

Copyright (c) 2014 [Glavin Wiechert](https://github.com/Glavin001).  
Licensed under the MIT license.
