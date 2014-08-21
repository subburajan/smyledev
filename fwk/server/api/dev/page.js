
var FWK = "../../";

module.exports = function(app) {	

	var obj = require(FWK + "/api/_API")(app, {
		id: "dev/page",
		pmenu: "page",
		page_title: "Pages",
		cascade: true,
		optText: "id",
		populate: [
			{ path: "table", select: "name" },
			{ path: "jq_fields", select: "ui_name" },
			{ path: "man_fields", select: "ui_name" },
			{ path: "det_sets.fields", select: "ui_name"},
			{ path: "det_jq_sets.id_field", select: "ui_name"},
			{ path: "det_jq_sets.unique", select: "ui_name"},			
			{ path: "det_jq_sets.man_fields", select: "ui_name"},
			{ path: "det_jq_sets.jq_fields", select: "ui_name"},
			{ path: "tlinks.roles", select: "name"},
			{ path: "tlinks.params", select: "ui_name"},
			{ path: "tlinks.field", select: "ui_name"}
		],
		jqtable: {
			where: function(query) {
				var args = {};
				if(query.title) {
					args.title = { $regex: new RegExp(".*" + query.title + ".*", "i") };
				}
				return args;
			},
			fields: "id title table jq_fields man_fields isTablePage pageType active"
	  	},
	  	projections: {
	  		tlinks: {
	  			composite: true,
	  			title: "Links",
	  			jq: {
		  			fields: "title url href roles field params type",
	  			}
	  		},

	  		det_sets: {
	  			composite: true,
	  			title: "Detail FieldSets",
	  			jq: {
		  			fields: "title fields",
	  			}
	  		},

	  		det_jq_sets: {
	  			composite: true,
	  			title: "Detail Jquery FieldSets",
	  			jq: {
		  			fields: "id_field unique title jq_fields man_fields",
	  			}
	  		}

	  	},
		controller: "Page",
		auth: {
			write: [ "DEVELOPER" ],
			read: [ "DEVELOPER" ],
			create: [ "DEVELOPER" ]
		}
	}, {
		
	});

};

