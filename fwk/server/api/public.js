
var Constants = require("../../../etc/Constants");
var Util = require("../common/Util");
var UserController = require("../controller/user");

var _ = require("underscore");

module.exports = function(app) {
	
	var proj_title = Constants.project.title;
	var proj_name = Constants.project.name || proj_title;

	var R = Constants.Enums.Roles;

	app.get("/", function(req, res) {
		if(req.user) {
			return res.redirect("/home");
		}
        res.render("index", {
       		page_title: proj_title,
       		pmenu: "home",
			per:  Constants.Enums.Roles.PUBLIC.value
        });
	});

	app.get("/devsignup", function(req, res) {
		var title = "Developer Signup";

		var args = {
			obj: JSON.stringify({ Roles: { DEVELOPER: R.DEVELOPER, ADMIN: R.ADMIN } }),
			pageid: "dev/signup",
			page_title: title,
		};
		res.render("fwk/general/new-form", args);
	});
	
	if(proj_name) {
		var roles1 = _.extend({}, R);
		delete roles1.DEVELOPER;
		delete roles1.ADMIN;
		delete roles1.PUBLIC;
		
		app.get("/signup", function(req, res) {
			var title = "New User Registration";
			var roles = [];
			var args = {
				obj: JSON.stringify({ Roles: roles1 }),
				pageid: "signup",
				page_title: title,
				ext_script: null
			};
			res.render("fwk/general/new-form", args);
		});
	}
	
	app.post("/signup", function(req, res) {
		var data = Util.parseReqJson(req.body.data);
		
		UserController.create(data, function(err, result) {
			Util.returnResponse(err, result, res);
		});
	});

};
