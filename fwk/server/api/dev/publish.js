
var ejs = require("ejs");
var fs = require("fs");
var path = require("path");
var _ = require("underscore");

var Auth = require("../../common/AuthMiddware");
var Constants = require("../../../../etc/Constants");
var Util = require("../../common/Util");

var ProjectMgr = require("../../manager/project");

var Async = require("async");

var API = require("../_API");

var mongoose = require("mongoose");

var proj_home = Constants.project.home;
var temp_path = path.resolve(Constants.root + "/etc/templates/");

//------------------------------------------------------------------------------------------------
//			Configurations 
//------------------------------------------------------------------------------------------------

var models = {	
	enum: [ mongoose.model("Enum"), [ { name: "enum", dir: "etc" } ], 1, function(obj, cb) { cb(); } ],
	
	role: [ mongoose.model("Role"), [ { name: "role", dir: "etc" } ], 1, function(obj, cb) {
		buildRoleAccess(obj);
		popPageIds(obj, cb);
		sortRoles(obj);
	}, function(qry) {
			qry.sort("seq");
		}
	],
	
	table: [ mongoose.model("Table"), [ 
			{ name: "model", dir: "server" } 
		], function(obj) {
			setFieldEnums(obj.fields);
			return obj.name;
		}, function(obj, map) {
			setTableRef(obj.fields, map);
			var arr = [];
			obj._unique && arr.push(obj._unique);
			obj._opt && ( arr = arr.concat(obj._opt));
			
			setTableRef(arr, map);
			
			popTableFieldChilds(obj);
			
		}, null, { table: true }
	],
	
	page: [ mongoose.model("Page"), [ 
			{ name: "api", dir: "server" }, 
			{ name: "index", dir: "client" },
			{ name: "new", dir: "client" },
			{ name: "detail", dir: "client" }  
		], function(obj) {
			setFieldEnumsAndSort(obj.jq_fields);
			setFieldEnumsAndSort(obj.man_fields);
			
			_.each(obj.det_sets, function(set) {
				setFieldEnumsAndSort(set.fields);
			});

			_.each(obj.det_jq_sets, function(set) {
				setFieldEnum(set.id_field);
				setFieldEnum(set.unique);
				setFieldEnumsAndSort(set.jq_fields);
				setFieldEnumsAndSort(set.man_fields);
			});
			
			if(obj.isTablePage) {
				return obj.table.name;
			}
			return obj.id;
		}, function(obj, map1, map2, map3, roleTables) {
			setRefs(obj.jq_fields, map1, map2);
			setRefs(obj.man_fields, map1, map2);
			
			_.each(obj.det_sets, function(set) {
				setRefs(set.fields, map1, map2);
			});
			
			_.each(obj.det_jq_sets, function(set) {
				setRefs([ set.id_field, set.unique ], map1, map2);
				setRefs(set.jq_fields, map1, map2);
				setRefs(set.man_fields, map1, map2);
			});
			
			obj.tlinks && _.each(obj.tlinks, function(tlink) {
				tlink.field && setRefs([ tlink.field ], map1, map2);
				
				if(!tlink.params) {
					return;
				}
				var arr = [];
				_.each(tlink.params, function(param) {
					arr.push(param.id);
				});
				
				tlink.params = arr;
			});
			
			var tableid = obj.table._id;
			obj.table = map1[tableid];
			
			setFieldEnumsAndSort(obj.table.fields);

			var fieldIdMap = popTableFieldRefs(obj.table, map1, map2, map3);
			
			obj.fieldIdMap = fieldIdMap;
			
			var rtable = roleTables[tableid];
			if(rtable) {
				obj.roletable = rtable;
			}
		},
		null, { table: true, enum: true, role: true }
	]
};


//------------------------------------------------------------------------------------------------
//			Exported Funtions
//------------------------------------------------------------------------------------------------

/**
 * 
 * Export Functions
 * 
 */
module.exports = function(app) {	
	var per = [ Constants.Enums.Roles.DEVELOPER.value ];
	var auth = Auth.forRoles(per, per);
	
	app.all("/dev/publish/*", auth);
	app.all("/dev/project/*", auth);
	
	app.post("/dev/publish/:type", function(req, res) {
		var table = req.params.type;
		var cfg = models[table];
		var model = cfg[0];
		addPopulates(model.find({}), table, cfg[4]).lean().exec(function(err, result) {
			if(err) {
				return Util.failure(err, "Failed to fetch data from table: " + table);
			}
			var temp = cfg[1];
			if(cfg[2] == 1) {
				return cfg[3](result, function() {
					build(result, temp[0], false, function(err, r) {
						Util.returnResponse(err, r, res);
					});
				});
			}
			
			var arr = [];
			var dirGetFn = cfg[2];
			_.each(result, function(obj) {
				var dir = dirGetFn(obj);
				_.each(temp, function(t) {
					arr.push(function(cb) {
						build(obj, t, dir, cb);
					});
				});
			});
			
			findRefObjAndRun(arr, result, cfg, res);			
		});
	});

	app.post("/dev/publish/:type/:id", function(req, res) {
		var table = req.params.type;
		var cfg = models[table];
		var model = cfg[0];
		addPopulates(model.findById(req.params.id), table, cfg[4]).lean().exec(function(err, result) {
			if(err) {
				return Util.failure(err, "Failed to fetch data from table: " + table);
			}
			var temp = cfg[1];
			if(cfg[2]) {
				dir = cfg[2](result);
			}
			
			var arr = [];
			_.each(temp, function(t) {
				arr.push(function(cb) {
					build(result, t, dir, cb);
				});
			});
			
			findRefObjAndRun(arr, [result], cfg, res);
		});
	});

//------------------------------------------------------------------------------------------
//			Publish Project
//------------------------------------------------------------------------------------------
	app.post("/dev/project/update", function(req, res) {
		var proj_home = Constants.project.home;
		
		if(fs.existsSync(proj_home)) {
			ProjectMgr.update(proj_home);
			return res.send(Util.success("Project updated successfully"));
		}
		
		res.send(Util.failure("Project doesn't exists"));
	});

//------------------------------------------------------------------------------------------
//			Build Project
//------------------------------------------------------------------------------------------	
	
	function build(obj, temp, subdir, cb) {	
		var data = compile(temp.name, obj);
		
		var p = proj_home;
		if(temp.dir) {
			p += "/" + temp.dir;
			if(!fs.existsSync(p)) {
				fs.mkdirSync(p);
			}
			
			if(subdir) {
				subdir = subdir.toLowerCase();
				p += "/" + subdir;
				if(!fs.existsSync(p)) {
					fs.mkdirSync(p);
				}
				
				if(temp.dir == "client") {
					p += "/js";	
					if(!fs.existsSync(p)) {
						fs.mkdirSync(p);
					}
				}
			}
		}
		p += "/" + temp.name + ".js";
		
		fs.writeFile(p, data, function(err, result) {
			if(err) {
				console.log(err);
				return cb("Failed: " + err);
			}
		    cb(false, "Successfully published");
		});
	}
	
	function cleanProj() {
		if(fs.existsSync(proj_home)) {
			throw "Project already exists";
		}
		//Util.cleanDir(proj_home);
	}

	function compile(template, args) {
		var str = fs.readFileSync(temp_path + "/" + template + '.ejs', 'utf8');
		return ejs.render(str, {
			args: args,
			Enums: Constants.Enums
		});
	}
	
//------------------------------------------------------------------------------------------
//			create Pages
//------------------------------------------------------------------------------------------
	
	app.post("/dev/project/createPages", function(req, res) {
		Async.parallel([
			function(cb) {
				models.table[0].find({}).lean().exec(cb);
			}, 
			function(cb) {
				models.page[0].find({}).select("table").lean().exec(cb);
			}
		], function(err, arr) {
			if(err) {
				return res.send(Util.failure("Server Err: " + err));
			}
			
			var tables = arr[0], paged = [];
			_.each(arr[1], function(a) {
				paged.push(a.table.toString());
			});
			
			var newPages = [];
			_.each(tables, function(table) {
				if(paged.indexOf(table._id.toString()) == -1) {
					newPages.push({
						table: table._id,
						id: table.name.toLowerCase(),
						title: table.name,
						isTablePage: true,
					});
				}
			});
			
			if(newPages.length == 0) {
				return Util.returnResponse(false, "Number of Pages created: 0", res);	
			}
			
			models.page[0].create(newPages, function(err, result) {
				if(err) {
					err = "Server Err: " + err;
				}
				if(result) {
					result = "Number of Pages created: " + newPages.length;
				}
				Util.returnResponse(err, result, res);	
			});
		});
	});

	
	app.get("/dev/validate_page", function(req, res) {
		Async.parallel([
			function(cb) {
				models.page[0].find({}).select("man_fields table").lean().exec(cb);		
			},
			function(cb) {
				models.table[0].find({}).select("name fields").populate("fields").lean().exec(cb);	
			}
		], function(err, arr) {
			if(err) {
				return res.send(Util.failure("Internal server error"));
			}
			var tableMap = {};
			_.each(arr[1], function(table) {
				tableMap[table._id] = table;
			});
			var map = {};
			_.each(arr[0], function(page) {
				var invalidFields = validatePage(page, tableMap[page.table]);
				(invalidFields.length > 0) && (map[page._id] = invalidFields);
			});
			res.send(Util.success(map));
		});
	});

	app.get("/dev/validate_page/:pageid", function(req, res) {
		models.page[0].findById(req.params.pageid).
			select("man_fields table").lean().exec(function(err, page) {
			if(err) {
				return res.send(Util.failure("Internal server error"));
			}
			
			models.table[0].find({ _id: page.table }).
				select("name fields").populate("fields").lean().exec(function(err, arr) {
				
				if(err) {
					return res.send(Util.failure("Internal server error"));
				}
 
				var invalidFields = validatePage(page, arr[0]);
				res.send(Util.success(invalidFields));
			});
		});
	});
	
	app.get("/dev/validate_table", function(req, res) {
		models.table[0].find({ }).
			select("name fields").populate("fields").lean().exec(function(err, arr) {
			
			if(err) {
				return res.send(Util.failure("Internal server error"));
			}
 
			var map = {};
			_.each(arr, function(t) {
				var err = validateTable(t);
				if(err) {
					map[t._id] = err;
				}
			});
			
			res.send(Util.success(map));
		});
	});
	
	app.get("/dev/validate_table/:tid", function(req, res) {
		models.table[0].findById(req.params.tid).
			select("name fields").populate("fields").lean().exec(function(err, table) {
			
			if(err) {
				return res.send(Util.failure("Internal server error"));
			}

			res.send(Util.success(validateTable(table)));
		});
	});

};

//------------------------------------------------------------------------------------------------
//			Misc Funtions
//------------------------------------------------------------------------------------------------

/**
 * 
 * Set References
 * 
 * @param {Object} arr
 * @param {Object} result
 * @param {Object} cfg
 * @param {Object} res
 */
function findRefObjAndRun(arr, result, cfg, res) {
	if(cfg[5] == null) {
		return Async.parallel(arr, function(err, r) {
			if(typeof(r) == "object") {
				r = "Number of files generated: " + r.length;
			}
			Util.returnResponse(err, r, res);
		});
	}
	
	var arr1 = [];
	arr1.push(function(cb) {
		models.table[0].find({})
		.populate("reader").populate("writer").populate("creator").populate("_unique")
		.populate("_opt").populate("fields").lean().exec(cb);	
	});
	
	if(cfg[5].enum) {
		arr1.push(function(cb) {
			models.enum[0].find({}).lean().exec(cb);
		});
	}
	
	if(cfg[5].role) {
		arr1.push(function(cb) {
			var qry = models.role[0].find({});
			addPopulates(qry, "role").lean().exec(cb);
		});
	}
	
	Async.parallel(arr1, function(err, r) {
		if(err) {
			console.log("ERR: " + err);
			return Util.failure("Failed to find Table Associations: " + err);
		}

		var tableMap = arrToMap(r[0]);
		var enumMap = arr1.length > 1 && arrToMap(r[1]);
		if(arr1.length > 2) {
			var roleMap = arrToMap(r[2]);
			var roleTables = roleTableMap(r[2], tableMap);
		}

		var fn = cfg[3];
		_.each(result, function(obj) {
			fn(obj, tableMap, enumMap, roleMap, roleTables);
		});
	
		Async.parallel(arr, function(err, r) {
			if(typeof(r) == "object") {
				r = "Number of files generated: " + r.length;
			}
			Util.returnResponse(err, r, res);
		});
	});
}

/**
 * populate Page Reference for Roles
 * 
 * @param {Object} roles
 * @param {Object} cb
 */
function popPageIds(roles, cb) {
	models.page[0].find({}).select("id").lean().exec(function(err, arr) {
		if(err) {
			return cb();
		}
		var map = arrToMap(arr);
		function setRef(menu) {
			if(menu.pageid) {
				menu.pageid = map[menu.pageid];
			}
			if(menu.tablePage) {
				menu.tablePage = map[menu.tablePage];
			}
		}

		_.each(roles, function(role) {
			createRSDir(role);
			_.each(role.menus, function(menu) {
				setRef(menu);
				menu.childs && _.each(menu.childs, function(child) {
					setRef(child);
				});
			});
		});
		cb();
	});
}

function sortRoles(roles) {
	_.each(roles, function(role) {
		Util.sortAsc(role.menus, comparator);
		_.each(role.menus, function(menu) {
			Util.sortAsc(menu.childs, comparator);	
		});
	});
	
	function comparator(a1, a2) {
		if(a1.oi > a2.oi) {
			return -1;
		} else if(a1.oi == a2.oi) {
			return 0;
		}
		return 1;
	}
}

function createRSDir(role) {
	var dir = role.name.toLowerCase();
	var client = proj_home + "/client/" + dir;
	if(!fs.existsSync(client)) {
		fs.mkdirSync(client);
	}
	var server = proj_home + "/server/" + dir;
	if(!fs.existsSync(server)) {
		fs.mkdirSync(server);
	}	
}

function arrToMap(r) {
	var map = {};
	_.each(r, function(obj) {
		map[obj._id.toString()] = obj;
	});
	return map;
}

function roleTableMap(roles, tableMap) {
	var map = {};
	_.each(roles, function(role) {
		if(!role.roletable) {
			return;
		}
		var  tables = role.tables;
		if(!tables) {
			return;
		}
		var rolename = role.name.toUpperCase();

		addToMap(role.roletable._id, rolename, "_id");
		
		_.each(tables, function(row) {
			var fid = row.field && row.field.id || "_id";
			var arr = addToMap(row.table._id, rolename, fid);
			var f = row.foreign;
			if(f) {
				arr[1] = f.id;
				
				var ftable = tableMap[f.par.toString()];
				arr[2] = ftable.name;
			}
		});
	});
	return map;
	
	function addToMap(table, role, field) {
		var e = map[table];
		if(!e) {
			e = map[table] = { };
		}
		return e[role] = [ field ]; // 0: field, 1: foreign, 2: foreign_table
	}
}

//----------------------------------------------------------------------------------------
//	Validation	
//----------------------------------------------------------------------------------------


function validateTable(table) {
	var err = [];
	var orders = [], no_lnk = true;

	_.each(table.fields, function(f) {
		if(!err[0]) {
			if(orders[f.oi] > 0) {
				err[0] = true;
			}
			orders[f.oi] = 2;
		}
		
		if(f.ui_detlnk) {
			no_lnk = false;
		}
	});
	no_lnk && (err[1] = true);

	return err.length > 0 && err;
}

function validatePage(page, table) {
	var errFields = [];
	var man_fields = [];
	_.each(page.man_fields, function(f) {
		man_fields.push(f.toString());
	});
	_.each(table.fields, function(field) {
		if(field._req && (field._enum == null) &&
			man_fields.indexOf(field._id.toString()) == -1) {
			
			var fid = field._id.toString();
			
			var isChild = _.find(table.fields, function(f) {
				if(!f.childs || f.childs.length == -1) {
					return;	
				}
				var r1 = _.find(f.childs, function(c) {
					return c.toString() == fid;
				});
				if(r1) {
					return true;
				}
			});
			
			(!isChild) && errFields.push(field.ui_name);
		}
	});

	return errFields;
}


//------------------------------------------------------------------------------------------------
//			Common Funtions
//------------------------------------------------------------------------------------------------

function setFieldEnums(fields) {
	_.each(fields, function(field) {		
		setFieldEnum(field);
	});
}

function setFieldEnumsAndSort(fields) {
	var arr = [];
	_.each(fields, function(f) {
		if(!f.oi) {
			f.oi = 1;
		}
	});
	Util.sortAsc(fields, function(a, b) {
		if(a.oi > b.oi) {
			return -1;
		}
		return 0;
	});

	_.each(fields, function(field) {		
		setFieldEnum(field);
	});
}


function setFieldEnum(field) {
	var E = Constants.Enums;
	setEnum(field, E.DataTypes, "_type");
	setEnum(field, E.InpTypes, "ui_itype");
	setEnum(field, E.SearchTypes, "ui_jq_search");
}

function setEnum(field, E, name) {
	var val = field[name];
	if(typeof(val) == "number") {
		field[name] = Constants.getEnumByValue(E, val);
	}
}

function setRefs(arr, tableMap, enumMap) {
	_.each(arr, function(obj) {
		setRef(obj, tableMap, "par");
		setRef(obj, tableMap, "_ref");
		setRef(obj, enumMap, "_enum");
	});
}

function setRolePers(field, roleMap, key, map) {
	var arr1 = field[key];
	if(!arr1 || arr1.length == 0) {
		return;
	}
	
	var arr = [];
	_.each(arr1, function(r) {
		var role = roleMap[r.toString()];
		arr.push(role.name.toUpperCase());
	});
	
	map[field.id] = arr;
}

function setTableRef(arr, map) {
	_.each(arr, function(obj) {
		setRef(obj, map, "par");
		setRef(obj, map, "_ref");
	});
}

function setRef(obj, map, name) {
	if(obj[name] && obj[name]._id == undefined) {
		obj[name] = map[obj[name]];
	}
}

function addPopulates(qry, type, fn) {
	var pops = API.getCfg("/dev/" + type).populate;
	_.each(pops, function(pop) {
		qry = qry.populate(pop.path);
	});
	fn && fn(qry); 
	return qry;
}

//------------------------------------------------------------------------------------------------
//			Table Fields child Reference Population
//------------------------------------------------------------------------------------------------

function popTableFieldChilds(table) {
	var map = {};
	var groups = [];

	_.each(table.fields, function(obj) {
		map[obj._id] = obj;
		if(obj.childs && obj.childs.length > 0) {
			if(obj.childs[0]._id == undefined) {
				groups.push(obj);
			}
		}	
	});
	
	if(groups.length == 0) {
		return;
	}
	
	var childFields = {};
	_.each(groups, function(obj) {
		var arr1 = [];
		_.each(obj.childs, function(child) {
			arr1.push(map[child]);
			childFields[child] = 1;
		});
		
		obj.childs = arr1;
	});
	
	var arr = [];
	for(var k in map) {
		if(childFields[k] == null) {
			arr.push(map[k]);
		}
	}

	table.fields = arr;
}

//------------------------------------------------------------------------------------------------
//			Table fields Reference population
//------------------------------------------------------------------------------------------------


function popTableFieldRefs(table, tableMap, enumMap, roleMap) {
	var fieldIdMap = {};
	var /*foreign,*/ pers_ro = {}, pers_hidden = {}, immutable = [];
	
	var fieldVsEnumName = {};
	
	_.each(table.fields, function(field) {
		if(field._ref != null) {			
			var t = tableMap[field._ref];
			var arr = [];
			_.each(field.ui_jq_pop_sel, function(sel) {
				arr.push(sel.toString());
			});
			
			var enumFields = {};
			var arr1 = [];
			_.each(t.fields, function(refField) {
				if(arr.indexOf(refField._id.toString()) > -1) {
					arr1.push(refField.id);
				
					if(refField._enum) {
						enumFields[refField.id] = enumMap[refField._enum.toString()].name;
					}
				}
			});
			field.ui_jq_pop_sel = arr1;
			field.ref_enumFields = !_.isEmpty(enumFields) && enumFields;
		} else if(field._enum) {
			fieldVsEnumName[field.id] = enumMap[field._enum].name;
		}

		setRolePers(field, roleMap, "read_only", pers_ro);
		setRolePers(field, roleMap, "hidden", pers_hidden);
		
		fieldIdMap[field.id] = field;
		/*if(field._foreign) {
			foreign = field._foreign;
		}*/
		
		if(field.immutable) {
			immutable.push(field.id);
		}
	});
	
	table._pers_ro = pers_ro;
	table._pers_hidden = pers_hidden;
	table._immutable = immutable;
	
	table._enumFields = fieldVsEnumName;
	
	/*if(foreign) {
		var found;
		for(var k in fieldIdMap) {
			var v = fieldIdMap[k];
			if(v._id.toString() == foreign) {
				found = v;
				break;
			}
		}
		if(found) {
			var ff = [];
			for(var k in fieldIdMap) {
				var v1 = fieldIdMap[k];
				if(v1._foreign) {
					v1._foreign = found;
					ff.push(v1.id);
				}
			}
			var ftable = tableMap[found.par];
			table._parent_ref = {
				model: ftable.name,
				proj: ff.join(" ")
			};
		}
	}*/
	
	popTableFieldChilds(table);
	
	return fieldIdMap;
}


function buildRoleAccess(roles) {
	_.each(roles, function(role) {
		var roletable = role.roletable;
		if(!roletable) {
			return;
		}
		var ra = { 
			model: roletable.name
		};
		
		var foreign = [];
		_.each(role.tables, function(table) {
			var f = table.foreign;
			if(f && foreign.indexOf(f.id) == -1) {
				foreign.push(f.id);			
			}
		});
		ra.foreign = foreign;
		
		role.ra = ra;
	});
}
