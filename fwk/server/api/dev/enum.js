
var FWK = "../../";

module.exports = function(app) {	

	var obj = require(FWK + "/api/_API")(app, {
		id: "dev/enum",
		pmenu: "enum",
		page_title: "Constants",
		cascade: true,
		optText: "name",
		jqtable: {
			where: function(query) {
				var args = {};
				if(query.name) {
					args.name = { $regex: new RegExp(".*" + query.name + ".*", "i") };
				}
				return args;
			},
			fields: "name values",
	  	},
	  	projections: {
	  		values: {
	  			jq: {
		  			fields: "value text name"
	  			},
	  			composite: { uniqueField: "value" },
	  			title: "Values"
	  		}
	  	},
		controller: "Enum",
		auth: {
			write: [ "DEVELOPER" ],
			read: [ "DEVELOPER" ],
			create: [ "DEVELOPER" ]
		}
	}, {
		
	});

};


