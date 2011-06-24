var fs = require('fs');
var getMimeType = require('simple-mime')('application/octet-stream');
var path = require('path');
var riak = require('riak-js');
var util = require('util');
var watch = require('watch');

var syncDir = module.exports.syncDir = function(dir, bucket){
	dir = path.resolve(dir);
	var db = riak.getClient({ debug: false });
	watch.watchTree(dir, {
		persistent: true,
		interval: 1000
	}, function(f, curr, prev){
		if (typeof f === 'object'){
			Object.keys(f).forEach(function(path){
				var curr = f[path];
				checkedSync(db, bucket, dir, path, curr);
			});
		}else if(typeof f === 'string'){
			checkedSync(db, bucket, dir, f, curr, prev);
		}
	});
}

var checkedSync = function(db, bucket, dir, filename, curr, prev){
	if (once(filename, curr)){
		var key = encodeURIComponent(filename.replace(dir + '/', ''));
		var op = operation(curr, prev);
		if (op !== 'removed'){
			compare(db, bucket, key, curr, function(err, outdated){
				outdated && sync(db, bucket, key, filename, curr, function(err){
					if (!err){
						console.log('Synced', key, 'to', 'http://' + path.join('127.0.0.1:8098', 'riak', bucket, key));
					}else{
						console.log('Error syncing', key, err)
					}
				});
			});
		}else{
			db.remove(bucket, key, function(err){
				!err && console.log('Removed', key);
			});
		}
	}
};

var cache = {};
var once = function(filename, stats){
	if (stats.isFile()){
		var key = [filename, +stats.mtime, stats.nlink].join('_');
		if (!cache[key]){
			cache[key] = true;
			return true;
		}
	}
};

var operation = function(curr, prev){
	if(prev === null){
		return 'created';
	}else if(curr.nlink === 0){
		return 'removed';
	}else{
		return 'changed';
	}
};

var compare = function(db, bucket, key, stats, callback){
	db.head(bucket, key, function(err, _, meta){
		if(!err || err.notFound){
			var dbTime = new Date(parseInt(meta.usermeta.mtime));
			var fsTime = stats.mtime;
			var exists = meta.statusCode === 200;
			var outdated = dbTime < fsTime;
			callback(null, !exists || outdated);
		}else{
			callback(err);
		}
	});
};

var sync = function(db, bucket, key, filename, stats, callback){
	fs.readFile(filename, function(err, data){
		if (!err){
			var contentType = getMimeType(filename);
			var mtime = +stats.mtime;
			var meta = {
				contentType: contentType,
				mtime: mtime
			};
			if (contentType === 'application/json'){
				try{
					data = JSON.parse(data);
				}catch(e){
					callback(e.message);
					return;
				}
			}
			db.save(bucket, key, data, meta, function(err, meta){
				if (!err){
					callback();
				}else{
					callback(err);
				}
			});
		}else{
			callback(err);
		}
	});
};
