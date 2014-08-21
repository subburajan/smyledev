
var FWK = "../../";

module.exports = function(app) {	

	var obj = require(FWK + "/api/_API")(app, {
		id: "dev/role",
		pmenu: "role",
		page_title: "Roles",
		cascade: true,
		optText: "name",
		populate: [
			{ path: "menus", select: "name" },
			{ path: "roletable", select: "name" },
			{ path: "tables.table", select: "name" },
			{ path: "tables.field", select: "ui_name" },
			{ path: "tables.foreign", select: "ui_name" }
		],
		jqtable: {
			where: function(query) {
				var args = {};
				if(query.name) {
					args.name = { $regex: new RegExp(".*" + query.name + ".*", "i") };
				}
				return args;
			},
			fields: "seq name menus active"
	  	},
	  	projections: {
	  		menus: {
	  			jq: {
		  			fields: "oi name active"
	  			},
	  			title: "Menus",
	  			optText: "name"
	  		},
	  		
	  		tables: {
	  			composite: { uniqueField: "table" },
	  			title: "Table Relation",
	  			jq: {
		  			fields: "table field foreign",
	  			}
	  		}
	  	},
		controller: "Role",
		auth: {
			write: [ "DEVELOPER" ],
			read: [ "DEVELOPER" ],
			create: [ "DEVELOPER" ]
		}
	}, {
		
	});

};


