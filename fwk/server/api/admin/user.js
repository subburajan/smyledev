
var UserController = require("../../controller/user");

var Constants = require("../../../../etc/Constants");

module.exports = function(app) {	

	require("../_API")(app, {
		id: "admin/user",
		page_title: "Users",
		cascade: true,
		jqtable: { 
			where: function(query) {
				var args = {};
				if(query.name) {
					args.name = { $regex: new RegExp(".*" + query.name + ".*", "i") };
				}
				return args;
			},
			fields: "image name email role active"
		},
		controller: UserController,
		auth: {
			write: [ "ADMIN" ],
			read: [ "ADMIN" ],
			create: [ "ADMIN" ]
		}
	}, {
		
	});

};
