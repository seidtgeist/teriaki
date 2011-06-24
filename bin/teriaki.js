#!/usr/bin/env node

process.title = 'teriaki';

var teriaki = require('../lib/teriaki');

var dir = process.argv[2];
var bucket = process.argv[3];

if (!dir || !bucket){
	console.log('Usage: teriaki <sync_path> <bucket_name>');
	process.exit(1);
}

teriaki.syncDir(dir, bucket);
