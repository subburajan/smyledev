
var FWK = "../../";

module.exports = function(app) {	

	var obj = require(FWK + "/api/_API")(app, {
		id: "dev/table",
		pmenu: "_table",
		page_title: "Tables",
		cascade: true,
		optText: "name",
		populate: [
			{ path: "fields", select: "ui_name" },
			{ path: "reader", select: "name" },
			{ path: "writer", select: "name" },
			{ path: "creator", select: "name" },
			{ path: "_unique", select: "ui_name" },
			{ path: "_opt", select: "ui_name" }
		],
		jqtable: {
			where: function(query) {
				var args = {};
				if(query.name) {
					args.name = { $regex: new RegExp(".*" + query.name + ".*", "i") };
				}
				return args;
			},
			fields: "name fields reader writer active writeOwner readOwner"
	  	},
	  	projections: {
	  		fields: {
	  			title: "Fields",
	  			jq: {
		  			fields: "oi id ui_name _type ui_type ui_itype _isArray _req ui_jq_search",
	  			},
	  			optText: "ui_name"
	  		}
	  	},
		controller: "Table",
		auth: {
			write: [ "DEVELOPER" ],
			read: [ "DEVELOPER" ],
			create: [ "DEVELOPER" ]
		}
	}, {
		
	});

};

