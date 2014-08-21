
var AuthMiddware = require("../common/AuthMiddware");
var Constants = require("../../../etc/Constants");
var fs = require("fs");

module.exports = function(app, passport, project) {

    var userAuth = AuthMiddware.common();

	app.all("/note", userAuth);
	app.all("/opts/*", userAuth);
	
	require("./note")(app);
    require("./uploader")(app);
    require("./login")(app, passport);
 	require("./install")(app);
	
	require("./admin/main")(app);
	require("./dev/main")(app);	
	
	require("./public")(app);

	var home_ejs;
	if(fs.existsSync(Constants.project.home + "/view/home.ejs")) {
		home_ejs = "home";
	} else {
		home_ejs = "fwk/general/home";
	}
	var devRole = Constants.Enums.Roles.DEVELOPER;
	app.get("/home", userAuth, function(req, res) {
		res.render(home_ejs, {
			user: req.user,
			pageid: "home",
			pmenu: "home",
			page_title: "Home",
			per: { r: true, w: false }
		});
	});
	
	app.get("/servermaint", function(req, res) {
		return res.render("fwk/common/error", {
			err: "Server Under Maintenance"
		});
	});
	
	project && project.addRoutes(app);

	var pubRole = Constants.Enums.Roles.PUBLIC;
	app.locals({
		project: Constants.project,
		title: "",
		PUBLIC: pubRole,
		Enums: JSON.stringify(Constants.Enums),
		_Enums: Constants.Enums,
		menus: Constants.getRoleCfg(pubRole.value).menus
	});
};
