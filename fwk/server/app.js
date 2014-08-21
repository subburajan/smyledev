
var fs = require("fs");

module.exports = function(cluster) {

	var Constants = require("./../../etc/Constants");
	Constants.init();
	var config = Constants.config;

	var mongoose = require("mongoose");
	mongoose.connect(config.db);
	
	require("./manager/mail")();

	var Util = require("./common/Util");
	Util.eachFile(__dirname + "/model", function(file) {
		if(~file.indexOf(".js")) {
			require(file);
		}	
	});
	
	var proj_home = Constants.project.home;
	if(proj_home && fs.existsSync(proj_home)) {
		var project = require(proj_home + "/project");
		project.loadModels();
	}
	
	var passport = require("passport");
	require("./manager/passport")(passport);

	var express = require("express");
	var app = express();
	require("./manager/express")(app, passport);

	require("./api/routes")(app, passport, project);

	app.listen(process.env.PORT || config.port);

};

