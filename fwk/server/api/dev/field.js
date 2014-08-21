
var FWK = "../../";

module.exports = function(app) {	

	var obj = require(FWK + "/api/_API")(app, {
		id: "dev/field",
		pmenu: "field",
		page_title: "Fields",
		cascade: true,
		optText: "ui_name",
		parent: {
			model: "Table",
			foreignKey: "id",
			proj: "fields",
			many: true
		},
		populate: [
			{ path: "par", select: "name" },
			{ path: "_ref", select: "name" },
			{ path: "_enum", select: "name" },
			{ path: "ui_jq_pop_sel", select: "ui_name" },
			{ path: "childs", select: "ui_name" },
			{ path: "hidden", select: "name" },
			{ path: "read_only", select: "name" },
			/*{ path: "_foreign", select: "ui_name" }*/
		],
		jqtable: {
			where: function(query) {
				var args = {};
				if(query.par) {
					args.par = query.par;
				}
				if(query._type) {
					args._type = query._type;
				}
				if(query.ui_itype) {
					args.ui_itype = query.ui_itype;
				}
				if(query._isArray) {
					args._isArray = query._isArray;
				}
				if(query._enum) {
					args._enum = query._enum;
				}
				if(query._ref) {
					args._ref = query._ref;
				}
				if(query._isParent) {
					args._isParent = query._isParent;
				}
				if(query.ui_name) {
					args.ui_name = { $regex: new RegExp(".*" + query.ui_name + ".*", "i") };
				}
				return args;
			},
			fields: "par oi id ui_name _type ui_type ui_itype _isArray _req ui_jq_search _enum _ref ui_jq_pop_sel"
	  	},
		controller: "Field",
		auth: {
			write: [ "DEVELOPER" ],
			read: [ "DEVELOPER" ],
			create: [ "DEVELOPER" ]
		}
	}, {
		
	});

};


