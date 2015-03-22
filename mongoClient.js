var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var callbacks = [];
var onConnect = function(err, db) {
	for(var i=0;i<callbacks.length;i++) {
		callbacks[i](err, db);
	}
}


module.exports.init = function (url, callback) {
	MongoClient.connect(url, function(err, db) {
		if(err) {
			throw new Error('Could not connect to MongoDb server: ', url);
			return;
		}
		module.exports.db = db;
		callback(err, db);
		onConnect(err, db);
	});
};
module.exports.on = function(event, callback) {
	if(event=='connect') {
		if(module.exports.db!==undefined) {
			callback(null, module.exports.db);
		}
		callbacks.push(callback);
	}
}