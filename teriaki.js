var db = require('riak-js').getClient({ debug: false });
var fs = require('fs');
var path = require('path');
var util = require('util');

function checkFile(db, filename, callback){
	var key = encodeURIComponent(path.basename(filename));
	fs.stat(filename, function(err, stats){
		db.head('docs', key, function(err, _, meta){
			var dbTime = new Date(meta.usermeta.mtime);
			var fsTime = stats.mtime;
			var exists = meta.statusCode === 200;
			var outdated = dbTime < fsTime;
			if (!exists || outdated){
				callback(db, key, filename, fsTime);
			}
		});
	});
}

function syncFile(db, key, filename, mtime){
	fs.readFile(filename, 'utf8', function(err, json){
		var data = JSON.parse(json);
		var meta = { mtime: mtime.toString() };
		db.save('docs', key, data, meta, function(err, meta){
			if (!err){
				console.log('Synced', filename);
			}
		});
	});
}

var join = path.join;
function syncDir(db, path){
	fs.readdir(path, function(err, files){
		files.forEach(function(filename){
			var fullFilename = join(path, filename);
			checkFile(db, fullFilename, syncFile);
		});
	});
}

function watch(db, dir){
	var interval = setInterval(function(){
		syncDir(db, dir);
	}, 1000);
}

var dir = join(__dirname, 'syncdir');
watch(db, dir);
