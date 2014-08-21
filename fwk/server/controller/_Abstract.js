
var _ = require("underscore");

var Util = require("../common/Util");

var Async = require("async");

function Abstract(model) {
	this.model = model;
	return this;
}

_.extend(Abstract.prototype, {

	get: function(id, cb) {
		this.model.findById(id, function(err, result) {
			if(err || !result) {
				console.log("Err# _Abstract.getDetail | " + err);
				return cb("Data doesn't exists: ");
			}
			cb(false, result);
		});
	},
	
	getDetail: function(args, cb) {
		var qry = this.model.findById(args.id);
		Util.addToQuery(qry, args);
		qry.exec(function(err, result) {
			if(err || !result) {
				console.log("Err# _Abstract.getDetail | " + err);
				return cb("Data doesn't exists");
			}
			cb(false, result);
		});
	},

	getOneDetail: function(args, fields, cb) {
		var qry = this.model.findOne(args.where);
		fields && (qry = qry.select(fields));
		Util.addToQuery(qry, args);
		qry.exec(function(err, result) {
			if(err || !result) {
				console.log("Err# _Abstract.getOneDetail | " + err);
				return cb("Data doesn't exists");
			}
			cb(false, result);
		});
	},
	
	getFields: function(id, fields, cb) {
		this.model.findById(id).select(fields).exec(function(err, result) {
			if(err) {
				console.log("Err# _Abstract.getFields | " + err);
				return cb("No Data Found: " + err);
			}
			cb(false, result);
		});		
	},
	
	getSubDocFields: function(arg, cb) {
		var qry = this.model.findOne(arg.where).select(arg.fields);
		arg.pop && (qry = Util.addToQuery(qry, { populate: arg.pop }) );
		//arg.sortBy && (qry = qry.sort(arg.sortBy));
		
		qry.exec(function(err, result) {
			if(err) {
				console.log("Err# _Abstract.getSubDocFields | " + err);
				return cb("No Data Found: " + err);
			}
			cb(false, result);
		});
	},
	
	getOne: function(where, fields, cb) {
		var qry = this.model.findOne(where);
		fields && (qry = qry.select(fields));
		qry.select(fields).exec(function(err, result) {
			if(err) {
				console.log("Err# _Abstract.getOne | " + err);
				return cb("Data doesn't exists");
			}
			cb(false, result);
		});
	},
	
	getAll: function(where, fields, sortBy, cb) {
		var qry = this.model.find(where).select(fields);
		sortBy && (qry = qry.sort(sortBy));
		qry.exec(function(err, result) {
			if(err) {
				console.log("Err# _Abstract.getAll | " + err);
				return cb("Data doesn't exists");
			}
			cb(false, result);
		});
	},

	getAllDeep: function(where, fields, pops, cb) {
		var qry = this.model.find(where).select(fields);
		_.each(pops, function(pop) {
			qry = qry.populate(pop);
		});
		qry.exec(function(err, result) {
			if(err) {
				console.log("Err# _Abstract.getAllDeep | " + err);
				return cb("Data doesn't exists");
			}
			cb(false, result);
		});
	},
	
	create: function(data, cb) {
		this.model.create(data, function(err, result) {
   			if(err) {
   				console.log("Err# _Abstract.create | = " + err);
   				return cb("Failed to Create: " + err);
   			}
   			cb(false, result);
   		});
	},
	
	update: function(id, data, cb) {
		this.updateOne({ _id: id }, data, cb);
	},
	
	updateOne: function(where, data, cb) {
   		this.model.update(where, data,
   			{ upsert: true, multi: false },
   		function(err, result) {
   			if(err) {
   				console.log("Err# _Abstract.updateOne | " + err);
   				return cb("Failed to Update: " + err);
   			}
   			cb(false, id);
   		});
	},	
	
	updateCascade: function(id, data, cb) {
		this._updateCascade(this.model.findById(id), data, cb);
	},

	updateCascadeOne: function(where, data, cb) {
		this._updateCascade(this.model.findOne(where), data, cb);
	},
	
	_updateCascade: function(qry, data, cb) {
   		qry.exec(function(err, obj) {
   			if(err || !obj) {
   				console.log("Err# _Abstract._updateCascade | " + err);
   				return cb("Failed to Update");
   			}
   			
   			for(var k in data) {
   				obj[k] = data[k];
   			}
   			obj.save(function(err, result) {
    			if(err) {
   					console.log("Err# #ERR MO.remove = " + err);
   					return cb("Failed to Update");
   				}
   				return cb(false, result);
   			});
   		});
	},	
	
	remove: function(id, cb) {
   		this.model.remove({ _id: id }, function(err, result) {
   			if(err) {
   				console.log("Err# _Abstract.remove | " + err);
   				return cb("Failed to Remove");
   			}
   			cb(false, result);
   		});		
	},

	removeOne: function(where, cb) {
   		this.model.remove(where, function(err, result) {
   			if(err) {
   				console.log("Err# _Abstract.removeOne | " + err);
   				return cb("Failed to Remove");
   			}
   			cb(false, result);
   		});		
	},
	
	removeCascade: function(id, cb) {
   		var qry = this.model.findById(id);
   		this._removeCascade(qry, cb);
	},
  
	removeCascadeOne: function(where, cb) {
   		var qry = this.model.findOne(where);
   		this._removeCascade(qry, cb);
	},

	_removeCascade: function(qry, cb) {
		var self = this;
   		qry.exec(function(err, obj) {
   			if(err || !obj) {
   				console.log("Err# _Abstract._removeCascade | " + err);
   				return cb("Failed to Remove");
   			}
   			if(!self.parent) {
   				return obj.remove(cb);
   			}
   			var setArg = { $pull: {} };
   			setArg.$pull[self.parent.proj] = obj._id;
   			
   			self.parent.model.update({ _id: obj.par }, setArg, { upsert: false, multi: false }, function(err, result) {
				if(err) {
					console.log("Err# _Abstract._removeCascade-1 | " + err);
					return cb("Failed to Remove");
				}
				obj.remove(cb);
			});
   		});
	},	
	
	removeAll: function(where, cb) {
   		this.model.remove(where, function(err, result) {
   			if(err) {
   				console.log("Err# _Abstract.removeAll | " + err);
   				return cb("Failed to Remove");
   			}
   			cb(false, result);
   		});
	},
	
	removeByIds: function(ids, cb) {
   		this.model.remove({ _id: { $in: ids }}, function(err, result) {
   			if(err) {
   				console.log("Err# _Abstract.removeByIds | " + err);
   				return cb("Failed to Remove");
   			}
   			cb(false, result);
   		});		
	},	
	
    getLatest: function(args, cb) {
		this.model.paginate(args, function(err, result) {
			if(err) {
				console.log("Err# _Abstract.getLatest | " + err);
				return cb("Server Internal Error ");
			}
			cb(false, result);
		});
	},
	
	/***
	 * Args = id, proj, data, uniqueField, isNew, embedded
	 */
	pushTo: function(args, cb) {
		var qry = this.model.findById(args._id);
		this._pushTo(qry, args, cb);
	},

	pushToOne: function(args, cb) {
		var qry = this.model.findOne(args.where);
		this._pushTo(qry, args, cb);
	},
	
	_pushTo: function(qry, args, cb) {
		var self = this;
		var proj = args.proj;
		var qry = qry.select(proj + " modified");
		qry.exec(function(err, obj) {
			if(err) {
				console.log("Err# _Abstract._pushTo | " + err);
				return cb("Server Internal Error");
			}
			if(!obj) {
				return cb("Parent Object Does not exists");
			}
			var uniqueField = args.uf;
			var data = args.data;
			if(uniqueField) {
				var arr = obj[proj];
				var found = false;
				var ufv = data[uniqueField];
				_.each(arr, function(a) {
					if(a[uniqueField] == ufv) {
						found = a;
					}
				});
				if(args.isNew) {
					if(found) {
						return cb("Object Already Exists");
					}
					pushNested(obj[proj], data, self.model, args.embedded);
				} else {
					if(!found) {
						return cb("Object doesn't exists");
					}
					for(var k in data) {
						found[k] = data[k];
					};
				}
			} else {
				pushNested(obj[proj], data, self.model, args.embedded);
			}
			
			obj.save(function(err, result) {
				if(err) {
					console.log("Err# _Abstract._pushTo | " + err);
					return cb("Server Internal Error");
				}
				return cb(false, result);
			});
		});
	},

	pullFrom: function(id, proj, pid, cb) {
		var setArg = { $pull: {} };
		setArg.$pull[proj] = { _id: id };
		
		this.model.update({ _id: pid }, setArg, { upsert: false, multi: false }, function(err, result) {
			if(err) {
				console.log("Err# _Abstract.pullFrom | " + err);
				return cb("Server Internal Error ");
			}
			cb(false, result);
		});
	},
	
	pullFromOne: function(id, proj, where, cb) {
		var setArg = { $pull: {} };
		setArg.$pull[proj] = { _id: id };
		
		this.model.update(where, setArg, { upsert: false, multi: false }, function(err, result) {
			if(err) {
				console.log("Err# _Abstract.pullFromOne | " + err);
				return cb("Server Internal Error ");
			}
			cb(false, result);
		});
	},	

	/*createForParent: function(pid, data, cb) {
		var self = this;
		this.parent.model.findById(pid).select(self.parent.proj).lean().exec(function(err, parObj) {
			if(err) {
				console.log("Err# _Abstract.createForParent | " + err);
				return cb("Server Internal Error");
			}
			if(!parObj) {
				return cb("Parent Object doesn't exists");
			}
			var withFields = self.parent.proj.split(" ");
			_.each(withFields, function(f) {
				data[f] = parObj[f];
			});
			
			self.create(data, function(err, obj) {
				if(err) {
					return cb(err);
				}
				cb(false, obj);		
			});
		});
	},*/
	
	createWithParent: function(pid, data, cb) {
		var self = this;
		Async.parallel([
			function(cb) {
				self.parent.model.findById(pid).select(self.parent.proj).exec(function(err, parObj) {
					if(err) {
						console.log("Err# _Abstract.createWithParent | " + err);
						return cb("Server Internal Error");
					}
					
					if(!parObj) {
						return cb("Parent Object doesn't Exists");
					}
					
					cb(false, parObj);
				});
			},
			function(cb) {
				var fkey = self.parent.foreignKey;
				var findArg = { par: pid };
				findArg[fkey] = data[fkey];
				
				self.model.findOne(findArg, function(err, obj) {
					if(err) {
						console.log("Err# _Abstract.createWithParent-1 | " + err);
						return cb("Server Internal Error");
					}
					if(obj) {
						return cb("Object Already Exists");
					}
					data.par = pid;
					self.create(data, function(err, obj) {
						if(err) {
							return cb(err);
						}
						cb(false, obj);		
					});
				});
			}
		], function(err, result) {
			if(err) {
				console.log("Err# _Abstract.createWithParent-2 | " + err);
				return cb(err);
			}
			var parObj = result[0];
			var childObj = result[1];
			if(self.parent.many) {
				parObj[self.parent.proj].push(childObj._id);
			} else {
				parObj[self.parent.proj] = childObj._id;
			}
			parObj.save(function(err, r1) {
				if(err) {
					console.log("Err# _Abstract.createWithParent-3 | " + err);
					return cb("Server Internal Error");
				}
				cb(false, result);
			});
		});
	}
	
});


function pushNested(parObj, data, model, isEmbedded) {
	if(!isEmbedded) {
		return parObj.push(data);
	}
	parObj.push(new model(data));
}


module.exports = Abstract;

