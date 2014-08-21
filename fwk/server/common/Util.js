
var _ = require("underscore");

var fs = require("fs");

function eachFile(dir, fn) {
    var files = fs.readdirSync(dir);
    for(var i in files) {
    	var file = files[i];
        var path = dir + '/' + file;
        var st = fs.statSync(path);
		if(st.isFile()) {
			fn(path);
		} else if(st.isDirectory()) {
            eachFile(path, fn);
        }
    }
}

function cleanDir(dir) {
    var files = fs.readdirSync(dir);
    for(var i in files) {
    	var file = files[i];
        var path = dir + '/' + file;
        var st = fs.statSync(path);
		if(st.isFile()) {
			fs.unlinkSync(path);
		} else if(st.isDirectory()) {
            cleanDir(path);
        }
    }
    fs.rmdirSync(dir);
}

function copyDir(src, dest, dir, rec) {
	src += dir; dest += dir;
	if(!fs.existsSync(dest)) {
		fs.mkdirSync(dest);
	}	
	
    var files = fs.readdirSync(src);
    for(var i in files) {
    	var file = files[i];
        var path = src + '/' + file;
        var st = fs.statSync(path);
		if(st.isFile()) {			
			copyFile(path, dest + "/" + file);
		} else if(rec && st.isDirectory()) {
			copyDir(src, dest, "/" + file, rec);
		}
    }	
}

function copyFile(src, dest) {	
	fs.createReadStream(src).pipe(fs.createWriteStream(dest));
}

module.exports = {
	
	cleanDir: cleanDir,
	
	eachFile: eachFile,
	
	copyDir: copyDir,
	
	copyFile: copyFile,

	success: function(msg) {
	  var res = {
		  status: "OK",
		  message: msg
	  };
	  return JSON.stringify(res);
	},

	failure: function(err, msg) {
	  var res = {
		  status: "FAIL",
		  reason: {
			  err: err,
			  msg: msg
		  }
	  };
	  return JSON.stringify(res);
	},

	returnResponse: function(err, result, res) {
		if(err) {
			result = this.failure(err);
		} else {
			result = this.success(result);
		}
		res.send(result);
	},
	
	random: function(limit) {
		return Math.floor((Math.random()*limit) + 1);		
	},

	_utcStrToDate: function(data, key) {
		if(key && data[key]) {
			return data[key] = new Date(Date.parse(data[key]));
		}
	},
	
	utcStrToDate: function(date) {
		return new Date(Date.parse(date));
	},

	parseReqJson: function(data) {
		return JSON.parse(decodeURIComponent(data));
	},
	
	queryMap: function(qry, props) {
		var map = {};
		_.each(props, function(prop) {
			if(qry[prop] != undefined) {
				map[prop] = qry[prop];
			}
		});
		return map;
	},
	
	sortByReq: function(qry, fields) {
		var sortBy = "";
		var iSort = qry.iSortCol_0;
		if(iSort > 0) {
			sortBy = (qry.sSortDir_0 == "asc" ? "-": "") + fields[iSort - 1];
		}
		return sortBy;
	},
	
	addToQuery: function(qry, args) {
		var pops = args.populate;
		if(pops) {
			if(pops instanceof Array) {
				_.each(pops, function(pop) {
					qry = qry.populate(pop);
				});
			} else {
				qry = qry.populate(pops);
			}
		}
		return qry;		
	},
	
	sortAsc: function(arr, comp) {
		var l = arr.length;
		for(var i = 0; i < l; i++) {
			for(var j = i + 1; j < l; j++) {
				var c = comp(arr[i], arr[j]);
				if(c == -1) {
					var temp = arr[i];
					arr[i] = arr[j];
					arr[j] = temp;					
				}
			}
		}
	},
	
	sortDesc: function(arr, comp) {
		this.sortAsc(arr, function() {
			var c = comp.apply(null, arguments);
			return c * -1;
		});
	}
};
