
var HOME = "../../../";

var Util = require("../common/Util");
var Auth = require("../common/AuthMiddware");
var _ = require("underscore");
var factory = require("../controller/factory");
var Constants = require(HOME + "/etc/Constants");

var mongoose = require("mongoose");

var cfgMap = {};

var PUBLIC = Constants.Enums.Roles.PUBLIC;

var indVsRole = {}, roleVsInd = {};
function init() {
	var _r = Constants.Enums.Roles;
	for(var k in _r) {
		var r = _r[k];
		var name = k.toUpperCase();
		indVsRole[r.value] = name;
		roleVsInd[name] = r.value;
	}
}
init();

var CREATOR = 0, READ_ONLY = 1, HIDDEN = 2, JQ_FIELDS = 3;

//------------------------------------------------------------------------------------
//		Module Exports
//------------------------------------------------------------------------------------
module.exports = function(app, cfg, api) {
	var id = cfg.id;
	var uri = "/" + id;
	cfgMap[uri] = cfg;
	
	var auth = cfg.auth;

	var create = getRoles(auth.create);
	var write = _.union(getRoles(auth.write), create);
	var read = getRoles(auth.read).concat(write);
	
	auth = Auth.forRoles(read, write);
	app.all(uri, auth);
	app.all(uri + "/*", auth);
	
	var postReadAuth = Auth.forRoles(read);
	
	function getPermissions(u) {
		if(u) {
			var map = u.getPermissions(write, read, create);
			map.fields = roleVsFields[u.role];
			if(u.w) {
				map.unmute = cfg.immutable;
			}
			return map;
		} else {
			return { r: true, w: false, c: false };
		}
	}
	
	cfg.getAccessQry = getAccessQry;
	cfg.getPermissions = getPermissions;

	var cntrlr = cfg.controller;	
	if(typeof(cntrlr) == "string") {
		var c_args = {};
		var cp = cfg.parent || cfg.parent_ref;
		if(cp) {
			cp.model = mongoose.model(cp.model);
			c_args.parent = cp;
		}
		cntrlr = factory(cntrlr, c_args);
	}
	
	var title = cfg.page_title || cfg.id;
	
	var popMap = {};
	_.each(cfg.populate, function(pop) {
		popMap[pop.path] = pop.select;
	});
	
	var roleVsFields = roleVsFieldsMap(cfg);
	
//------------------------------------------------------------------------------------
//		API Access | Get Request
//------------------------------------------------------------------------------------

	var page = api.page && api.page(cntrlr, cfg);

	app.get(uri, page || function(req, res) {
		fetchRefInfo(req.query, function(err, obj, param, ref) {
			if(err) {
				return res.render("fwk/common/error", {
					pmenu: cfg.pmenu || cfg.id,
					user: req.user,
					err: "Invalid paramater"
				});
			}

			var u = req.user;
			var per = getPermissions(u);
			var qry = getAccessQry(u);
			
			var _obj = { };
			if(obj) {
				_obj = { param: param, obj: obj, _ref: ref };
				if(!(qry && qry[param] == obj[param])) {
					per.w = false; per.c = false;
				}
			} else if(qry) {
				for(var k in qry) {
					_obj.param = k;
					break;	
				}
			}
			
			res.render(cfg.ejs || "fwk/general/table-form", {
				user: req.user,
				pmenu: cfg.pmenu || cfg.id,
				pageid: cfg.id,
				page_title: title,
				ext_script: cfg.index_ext,
				search: cfg.jqtable.where != undefined,
				_obj: JSON.stringify(_obj),
				per: per
			});
		});
	});

	var newPage = api.newPage && api.newPage(cntrlr, cfg);
	
	app.get(uri + "/new", newPage || function(req, res) {
		if(!checkCreatePer(req.user)) {
			return res.send(Util.failure("Permission denied"));
		}
		res.render(cfg.ejs || "fwk/general/new-form", {
			user: req.user,
			pmenu: cfg.pmenu || cfg.id,
			pageid: cfg.id,
			page_title: title,
			ext_script: cfg.new_ext,
		});
	});

	app.get(uri + "/:id", function(req, res) {
		var id = req.params.id;
		if(!hasObjectAccess(req.user, id)) {
			return res.send(Util.failure("Permission denied"));
		}
		
		var where = { _id: id };
		if(cfg.readOwner) {
			where.crBy = req.user._id;
		}

		cntrlr.getOne(where, null, function(err, result) {
			if(result) {
				result = result.toObject();
				removeHiddenFields(result, req.user);
				toEnumText(result, cfg.enumFields);
			}
			Util.returnResponse(err, result, res);
		});
	});
	
	app.get(uri + "/attr/:id", fetchAttrApi(function(req, res, where, fields) {
		cntrlr.getOne(where, fields.join(" "), function(err, result) {
			if(result) {
				result = result.toObject();
				toEnumText(result, cfg.enumFields);
			}
			Util.returnResponse(err, result, res);
		});
	}));
	
	app.get(uri + "/deep/:id", fetchAttrApi(function(req, res, where, fields) {
		var arr = getPopulates(fields, cfg.populate);
		cntrlr.getAllDeep(where, fields.join(" "), arr, function(err, result) {
			if(result && result.length > 0) {
				result = result[0].toObject();
				toEnumText(result, cfg.enumFields);
			} else {
				err = "Data doesn't exists";
			}
			Util.returnResponse(err, result, res);
		});
	}));

	app.get(uri + "/all/deep", fetchAttrApi(function(req, res, where, fields) {
		var arr = getPopulates(fields, cfg.populate);
		cntrlr.getAllDeep(where, fields.join(" "), arr, function(err, result) {
			if(result) {
				var arr = [];
				_.each(result, function(r) {
					arr.push(toEnumText(r.toObject(), cfg.enumFields));
				});
				result = arr;
			}
			Util.returnResponse(err, result, res);
		});
	}));

	function fetchAttrApi(fn) {
		return function(req, res) {
			var id = req.params.id, where;
			if(id) {
				if(!hasObjectAccess(req.user, id)) {
					return res.send(Util.failure("Permission denied"));
				}
				where = { _id: id };
			} else {
				where = getAccessQry(req.user);
			}
			
			if(cfg.readOwner) {
				where.crBy = req.user._id;
			}
	
			var fields = req.query.f;
			if(fields == null) {
				return res.send(Util.failure("Invalid Arguments"));
			}
			fields = fields.split(",");
			if(checkHiddenFields(fields, req.user)) {
				return res.send(Util.failure("Permission denied for some fields"));
			}
			
			fn(req, res, where, fields);
		};
	}
	
//------------------------------------------------------------------------------------
//		API Access | Post Request
//------------------------------------------------------------------------------------

	app.post(uri, api.create || function(req, res) {
		var data = Util.parseReqJson(req.body.data);
		if(!checkReadOnly(data, req.user) || !checkCreatePer(req.user)) {
			return res.send(Util.failure("Permission denied"));
		}
		
		var qry = getAccessQry(req.user);
		if(qry) {
			for(var k in qry) {
				if(data[k] && qry[k] != data[k]) {
					return res.send(Util.failure("Permission denied"));
				}
				data[k] = qry[k];
			}
		}

		toDate(data);
		cfg.parser && cfg.parser(data);
		data.crBy = req.user && req.user._id;
		
		if(cfg.parent) {
			cntrlr.createWithParent(req.query.parent, data, function(err, result) {
				Util.returnResponse(err, result, res);
			});
		} /*else if(cfg.parent_ref) {
			cntrlr.createForParent(req.query.parent, data, function(err, result) {
				Util.returnResponse(err, result, res);
			});
		} */ else {
			cntrlr.create(data, function(err, result) {
				Util.returnResponse(err, result, res);
			});
		}
	});

	app.post(uri + "/:id", api.update || function(req, res) {
		var data = Util.parseReqJson(req.body.data);
		if(!checkImmutable(data, req.user) || !checkReadOnly(data, req.user)) {
			return res.send(Util.failure("Permission denied"));
		}

		cfg.parser && cfg.parser(data);
		data.mdBy = req.user._id;

		var act = cfg.cascade? "updateCascade": "update";
		var where;
		if(cfg.writeOwner) {
			where = { _id: req.params.id, crBy: req.user._id };
			act += "One";
		} else {
			where = req.params.id;
		}
		
		var qry = getAccessQry(req.user);
		if(qry) {
			for(var k in qry) {
				where[k] = qry[k];
			}
		}
		
		cntrlr[act](where, data, function(err, result) {
			Util.returnResponse(err, result, res);
		});
	});
	
	app.post(uri + "/remove/:id", api.remove ||  function(req, res) {
		if(!checkCreatePer(req.user)) {
			return res.send(Util.failure("Permission denied"));
		}
		var act = cfg.cascade? "removeCascade": "remove";
		var where;
		if(cfg.writeOwner) {
			where = { _id: req.params.id, crBy: req.user._id };
			act += "One";
		} else {
			where = req.params.id;
		}
		cntrlr[act](where, function(err, result) {
			Util.returnResponse(err, result, res);
		});
	});
	
	
//----------------------------------------------------------------------------------
//	Jquery Table Request
//----------------------------------------------------------------------------------
	
	var jq_midd = api.jqtable && api.jqtable(cntrlr, cfg);
		
	app.post("/jqtable/" + cfg.id, postReadAuth, jq_midd || function(req, res) {
		var body = req.body;
		var args = { from: body.iDisplayStart, length: body.iDisplayLength };
		var jq = cfg.jqtable;
		var where = (jq.where && jq.where(body)) || {};
		
		if(cfg.readOwner) {
			where.crBy = req.user._id;
		}
		
		var fields, u = req.user;
		if(u) {
			fields = getFieldsForRole(u.role);
		}
		if(!fields) {
			fields = jq.fields.split(" ");
		}
		var qmap = req.query;
		for(var k in qmap) {
			if(popMap[k]) {
				where[k] = qmap[k];
				var i = fields.indexOf(k);
				if(i > -1) {
					fields.splice(i, 1);
				}
			}
		}
		
		var pre_where = getAccessQry(req.user);
		mergePreWhere(pre_where, where, fields);
		if(qmap.f) {
			fields.push(qmap.f);
		}

		var sortBy = Util.sortByReq(body, fields);
		var jqfields = fields.join(" ");

		var data = { where: where, fields: jqfields, sortBy: sortBy, args: args };
		cfg.populate && (data.populate = getPopulates(fields, cfg.populate));
		
		cntrlr.getLatest(data, function(err, result) {
			jqResponse(err, result, res, fields);
		});
	});

//----------------------------------------------------------------------------------
//	Detail Page Request
//----------------------------------------------------------------------------------

	var detailView = cfg.projections?  "detail-table-form": "detail-form";
	
	var dpage = api.detailPage && api.detailPage(cntrlr, cfg);
	
	app.get(uri + "/detail/:id", dpage || function(req, res) {
		var where = { _id: req.params.id };
		if(cfg.readOwner) {
			where.crBy = req.user._id;
		}
		var args = { where: where };
		cfg.populate && (args.populate = cfg.populate);

		cntrlr.getOneDetail(args, null, function(err, obj) {
			if(err || !obj) {
				res.render("fwk/common/error", {
					pmenu: cfg.pmenu || cfg.id,
					user: req.user,
					err: "Invalid " + id + " id"
				});
			} else {
				removeHiddenFields(obj, req.user);
				var fn = cfg.detailsArg;
				var args = {
					obj: JSON.stringify((fn && fn(obj)) || obj || {}),
					user: req.user,
					pageid: id,
					pmenu: cfg.pmenu || cfg.id,
					page_title: title,
					page_heading: title,
					subdocs: cfg.projections,
					ext_script: cfg.detail_ext,
					per: getPermissions(req.user)
				};

				res.render("fwk/general/" + detailView, args);
			}
		});
	});
	
	if(cfg.optText) {
		var opt_uri1 = uri + "_opts";
		app.get(opt_uri1, auth, optsCmd);
		redirectOptDet(opt_uri1);

		var opt_uri2 = "/opts/" + cfg.controller;
		app.get(opt_uri2, optsCmd);
		redirectOptDet(opt_uri2);
		
		function redirectOptDet(_uri) {
			app.get(_uri + "/detail/:id", function(req, res) {
				res.redirect(uri + "/detail/" + req.params.id);
			});
		}
		
		var optFields = cfg.optText.split(" ");
		function optsCmd(req, res) {
			var where = req.query || {};
			var pre_where = getAccessQry(req.user);
			if(pre_where) {
			 	_.extend(where, pre_where);			
			}
			
			if(cfg.readOwner) {
				where.crBy = req.user._id;
			}
			cntrlr.getAll(where, cfg.optText, cfg.optText, function(err, result) {
				if(!err) {
					result = conOptsToArr(result, optFields, cfg.enumFields);
				}
				Util.returnResponse(err, result, res);
			});
		}
	}
	
	if(cfg.projections) {
		for(var key in cfg.projections) {
			initSubDocApis(key, cfg.projections[key]);
		}
	}

	cfg.postReadAuth = postReadAuth;
	api.addApis && api.addApis(app, cfg);
	
	return {
		cntrl: cntrlr
	};

//------------------------------------------------------------------------------------
//		Sub Documents Apis
//------------------------------------------------------------------------------------

	function initSubDocApis(proj, subDoc) {
		var djq = subDoc.jq;
		var _uri = uri + "/:id/" + proj;
		if(subDoc.jq) {
			var pop = subDoc.populate || [];
			if(!subDoc.composite) {
				pop.push({ path: proj, select: djq.fields });
			}
			cfg.populate && _.each(cfg.populate, function(p) {
				if(p.path.indexOf(proj + ".") > -1) {
					pop.push(p);
				}
			});
			var fields = djq.fields.split(" ");

			app.post("/jqtable" + _uri, postReadAuth, function(req, res) {
				var body = req.body;
				var from = body.iDisplayStart, length = body.iDisplayLength;
				
				var where = { _id: req.params.id };
				if(cfg.readOwner) {
					where.crBy = req.user._id;
				}
				var data = { where: where, fields: proj, pop: pop };
				
				cntrlr.getSubDocFields(data, function(err, result) {
					if(result) {
						var arr = result[proj];
						var total = arr.length;
						var sortBy = Util.sortByReq(body, fields);
						_sort(arr, sortBy);
						
						if(length) {
							arr = arr.slice(from, parseInt(from) + parseInt(length));
						}

						result = {
							rows: arr,
							total: total
						};
					}
					jqResponse(err, result, res, fields);
				});
			});
		}
		
		if(subDoc.composite) {
			var uf = subDoc.composite.uniqueField || "_id";
			app.post(_uri, function(req, res) {
				var data = Util.parseReqJson(req.body.data);
				if(!checkImmutable(data, req.user) || !checkReadOnly(data, req.user)) {
					return res.send(Util.failure("Permission denied"));
				} 

				toDate(data);
				var args = { _id: req.params.id }, act = "pushTo";
				if(cfg.writeOwner) {
					args.crBy = req.user._id;
					args = { where: args };
					act += "One";
				}
				args.proj = proj;
				args.data = data;
				args.uf = uf;
				args.embedded = subDoc.embedded;
				args.isNew = true;
				
				cntrlr[act](args, function(err, result) {
					Util.returnResponse(err, result, res);
				});
			});
			
			app.post(_uri + "/:objid", function(req, res) {
				var data = Util.parseReqJson(req.body.data);
				if(!checkImmutable(data, req.user) || !checkReadOnly(data, req.user)) {
					return res.send(Util.failure("Permission denied"));
				} 
				
				toDate(data);
				data._id = req.params.objid;

				var args = { _id: req.params.id }, act = "pushTo";
				if(cfg.writeOwner) {
					args.crBy = req.user._id;
					args = { where: args };
					act += "One";
				}
				args.proj = proj;
				args.data = data;
				args.uf = "_id";
				args.embedded = subDoc.embedded;
				args.isNew = false;
				
				cntrlr[act](args, function(err, result) {
					Util.returnResponse(err, result, res);
				});
			});
		
			app.post(_uri + "/remove/:objid", function(req, res) {
				var where, act = "pullFrom";
				if(cfg.writeOwner) {
					where = { _id: req.params.id, crBy: req.user._id };
					act += "One";
				} else {
					where = req.params.id;
				}
				cntrlr[act](req.params.objid, proj, where, function(err, result) {
					Util.returnResponse(err, result, res);
				});
			});
		} else if(subDoc.optText) {
			var pop1 = { path: proj, select: subDoc.optText };
			var optFields = subDoc.optText.split(" ");
			app.post(_uri + "/opts", function(req, res) {
				var where = { id: req.params.id };
				if(cfg.readOwner) {
					where.crBy = req.user._id;
				}
				cntrlr.getSubDocFields({ where: where, fields: proj, pop: pop1 }, function(err, result) {
					if(!err) {
						result = conOptsToArr(result, optFields, cfg.enumFields);
					}
					Util.returnResponse(err, result, res);
				});
			});
		}
		
	}

//------------------------------------------------------------------------------------
//		Other Exports functions
//------------------------------------------------------------------------------------

	function fetchRefInfo(qry, fn) {
		for(var k in qry) {			
			var modelName = getRefModelName(k);
			if(!modelName) {
				continue;
			}		
			var cntrl = factory(modelName);
			var sel = popMap[k];

			return cntrl.getFields(qry[k], sel, function(err, obj) {
				if(obj) {
					obj = obj.toObject();
					
					var efields = getCfg("/" +  modelName.toLowerCase()).enumFields;
					toEnumText(obj, efields);
				} else {
					err = "Invalid id or data doesn't exists";
				}
				fn(err, obj, k, { ref: modelName, sel: sel.split(" ") });
			});
		}
		fn();
	}
	
	function checkImmutable(data, user) {
		var arr = cfg.immutable;
		if(!arr || arr.length == 0) {
			return true;
		}
		for(var k in data) {
			if(arr.indexOf(k) > -1) {
				return false;
			}
		}
		return true;
	}
	
	function checkReadOnly(data, user) {
		var Arr = roleVsFields[getUserRole(user)];
		var ro = Arr[READ_ONLY] || [];
		var hidden = Arr[HIDDEN] || [];
		 
		if(ro.length == 0 || hidden.length == 0) {
			return true;
		} 
		
		for(var k in data) {
			if(ro.indexOf(k) > -1 || hidden.indexOf(k) > -1) {
				return false;
			}
		}
		return true;
	}

	function checkHiddenFields(fields, user) {
		var Arr = roleVsFields[getUserRole(user)];
		var hidden = Arr[HIDDEN];
		 
		if(!hidden || hidden.length == 0) {
			return false;
		} 
		
		var l = hidden.length;
		for(var i = 0; i < l; i++) {
			if(fields.indexOf(hidden[i]) > -1) {
				return true;
			}
		}
		return false;
	}

	function removeHiddenFields(obj, user) {
		var Arr = roleVsFields[getUserRole(user)];
		var hidden = Arr[HIDDEN];
		 
		if(!hidden || hidden.length == 0) {
			return;
		} 
		
		var newarr = [];
		_.each(hidden, function(h) {
			delete obj[h];
		});
		return;
	}
	
	function checkCreatePer(user) {
		var role = getUserRole(user);
		return roleVsFields[role][CREATOR] == 1;
	}
	
	function getUserRole(user) {
		return (user && user.role) || PUBLIC.value;
	}
	
	function getFieldsForRole(role) {
		var arr = roleVsFields[role][JQ_FIELDS];
		if(arr) {
			return arr.slice(0);
		} 
	}
	
	function getRefModelName(field) {
		if(!popMap[field]) { //means it is not reference
			return;	
		}
		
		return cntrlr.model.schema.paths[field].options.ref;
	}
	
//------------------------------------------------------------------------------------
//		Role Access Callback
//------------------------------------------------------------------------------------

	function getAccessQry(u) {
		var ras = cfg.role_access;
		if(!ras) {
			return null;
		}
		
		var ra = ras[indVsRole[getUserRole(u)]];
		if(!ra) {
			return null;
		}

		var where = { };
		var f = ra.foreign;
		
		if(f && u.add_info && u.add_info[f]) {
			where[ra.field] = u.add_info[f];
		} else {
			where[ra.field] = u.objid;
		}
		return where;
	}
	
	function hasObjectAccess(u, id) {
		var ras = cfg.role_access;
		if(!ras) {
			return true;
		}
		
		var ra = ras[indVsRole[u.role]];
		if(!ra) {
			return true;
		}

		var where = { };
		var f = ra.foreign;
		if(f && u.add_info && u.add_info[f]) {
			return id == u.add_info[f];
		}
		return id == u.objid;
	}
};

module.exports.getCfg = getCfg;

module.exports.jqResponse = jqResponse;

module.exports.getPopulates = getPopulates;

module.exports.toEnumText = toEnumText;

//------------------------------------------------------------------------------------
//		Private Functions
//------------------------------------------------------------------------------------

function getCfg(uri) {
	return cfgMap[uri];
}

function jqResponse(err, result, res, fields) {
	var rows;
	if(err) {
		rows = { aaData: [], iTotalDisplayRecords: 0, iTotalRecords: 0 };
	} else {
		var data = conObjsToArr(result.rows, fields);
		rows = { iTotalDisplayRecords: result.total, 
					iTotalRecords: result.total, aaData: data };
	}
	res.send(rows);	
}

function conObjsToArr(rows, fields) {
	var data = [];
	_.each(rows, function(r) {
		var _r = [r._id];
		_.each(fields, function(f) {
			_r.push(r[f]);
		});
    	data.push(_r);
	});
	return data;
}

/**
 * Convert Options to Array
 * 
 * @param {Object} rows
 * @param {Object} fields
 * @param {Object} enums
 */
function conOptsToArr(rows, fields, enums) {
	var data = [];
	var E = Constants.Enums;
	
	_.each(rows, function(r) {
		var _r = [r._id];
		_.each(fields, function(f) {
			var val = r[f];
			if(enums && enums[f]) {
				val = Constants.getEnumByValue(enums[f], val).text;
			}
			_r.push(val);
		});
    	data.push(_r);
	});
	return data;
}

function toEnumText(obj, enums) {
	var E = Constants.Enums;
	for(var k in enums) {
		var val = obj[k];
		if(val) {
			obj[k] = Constants.getEnumByValue(enums[k], val).text;
		}
	}
	return obj;
}

function _sort(arr, field) {
	var asc = true;
	if(field.indexOf("-") == 0) {
		asc = false;
		field = field.substring(1);
	}
	var m = arr.length;
	for(var i = 0; i < m; i++) {
		for(var j = i + 1; j < m; j++) {
			var a = arr[i][field], b = arr[j][field];
			if(a > b) {
				var k = arr[i];
				arr[i] = arr[j];
				arr[j] = k;
			}
		}
	}
	if(!asc) {
		arr.reverse();
	}
}

function roleVsFieldsMap(cfg) {
	var map = {};
	for(var k in indVsRole) {
		map[k] = [];
	}
	
	var carr = cfg.auth.create;
	carr && _.each(carr, function(role) {
		var arr = map[ roleVsInd[role] ];
		arr[CREATOR] = 1;
	});

	build("read_only", READ_ONLY);
	
	if(build("hidden", HIDDEN)) {
		var fields = cfg.jqtable.fields.split(" ");
		for(var k in map) {
			var arr = map[k];
			var hidden = arr[HIDDEN];
			if(!hidden || hidden.length > 0) {
				continue;
			}
			
			var _fields = [];
			_.each(fields, function(f) {
				if(hidden.indexOf(f) == -1) {
					_fields.push(f);
				}
			});
			arr[JQ_FIELDS] = _fields;
		}	
	}
	
	return map;
	
	function build(key, ind) {
		var obj = cfg[key];
		if(!obj) {
			return false;
		}
		for(var k in obj) {
			var arr = obj[k];
			_.each(arr, function(a) {
				var i = roleVsInd[a];
				var roleArr = map[i];
				var e = roleArr[ind];
				if(e) {
					e.push(k);
				} else {
					roleArr[ind] = [ k ];
				}
			});
		}
		return true;
	}
}

//------------------------------------------------------------------------------------
//		Util Functions
//------------------------------------------------------------------------------------

function fromDate(data, props) {
	_.each(props, function(prop) {
		var v = data[prop];
		v && (data[prop] = DateFormat.dateToDateStr(v));
	});
}

function toDate(data, props) {
	_.each(props, function(prop) {
		Util._utcStrToDate(data, prop);
	});
}

function getRoles(keys) {
	var map = Constants.Enums.Roles;
	var roles = [];
	_.each(keys, function(k) {
		roles.push(map[k].value);
	});
	return roles;
}

function getPopulates(fields, populates, arr) {
	arr = arr || [];
	_.each(populates, function(p) {
		if(fields.indexOf(p.path) > -1) {
			arr.push(p);
		}
	});
	return arr;	
}


function mergePreWhere(pre_where, where, fields) {
	if(!pre_where) {
		return;
	}
	for(var k in pre_where) {
		if(!where[k]) {
			_.extend(where, pre_where);
			var i = fields.indexOf(k);
			(i > -1) && fields.splice(i, 1);
			return true;		
		} else {
			return false; //exists
		}
	}
}