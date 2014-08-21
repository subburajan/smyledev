
var Async = require("async");

var _ = require("underscore");

var Util = require("./Util");

module.exports = function(model) {
		
	return function(args, cb) {
	  	var where = args.where || {};
	  	var from = 0;
	  	var length = 10;
		var a = args.args;
		if(a) {
			from = a.from || from;
			length = a.length || length;
		}
	  	var sortBy = (args.sortBy || "") + " -modified";
		var fields = args.fields;

		Async.parallel([
			function(cb) {
				model.find(where).count(cb);
			},
			function(cb) {
				var qry = model.find(where).sort(sortBy).skip(from).limit(length).select(fields).lean();
				Util.addToQuery(qry, args);
				qry.exec(cb);
			}
		], function(err, result) {
			if(err) {
				console.log("Paginate ERR: " + err);
				return cb("Server Internal Error");
			}
			cb(false, { total: result[0], rows: result[1] });
		});
	};
};
