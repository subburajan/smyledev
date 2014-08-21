
var FWK = "../../";

module.exports = function(app) {	

	var obj = require(FWK + "/api/_API")(app, {
		id: "dev/menu",
		pmenu: "menu",
		page_title: "Menus",
		cascade: true,
		optText: "name",
		parent: {
			model: "Role",
			foreignKey: "name",
			proj: "menus",
			many: true
		},
		populate: [
			{ path: "par", select: "name" },
			{ path: "pageid", select: "id" },
			{ path: "tablePage", select: "title"},
			{ path: "childs.pageid", select: "title" },
			{ path: "childs.tablePage", select: "title" }
		],
		jqtable: {
			where: function(query) {
				var args = {};
				if(query.name) {
					args.name = { $regex: new RegExp(".*" + query.name + ".*", "i") };
				}
				if(query.par) {
					args.par = query.par;
				}
				return args;
			},
			fields: "par oi name pageid tablePage childs active"
	  	},
	  	projections: {
	  		childs: {
	  			jq: {
		  			fields: "oi name pageid tablePage pageuri active"
	  			},
	  			title: "Sub Menus",
	  			composite: { uniqueField: "name" },
	  		}
	  	},
		controller: "Menu",
		auth: {
			write: [ "DEVELOPER" ],
			read: [ "DEVELOPER" ],
			create: [ "DEVELOPER" ]
		}
	}, {
		
	});

};


