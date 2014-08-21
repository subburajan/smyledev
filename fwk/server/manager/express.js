
var fs = require("fs");
    
module.exports = function(app, passport) {

	var Constants = require("../../../etc/Constants");
	var config = Constants.config;
	var express = require('express');
	var partials = require("express-partials");
	var ConnectMongo = require("connect-mongo")(express);
	var flash = require("connect-flash");
	var helpers = require("view-helpers");
	var pkg = require(Constants.root + '/package.json');
	var engine = require('ejs-locals');

	app.set('showStackError', true);

	app.use(express.compress({
		filter: function (req, res) {
			return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
		},
		level: 9
	}));

	app.use(express.favicon());
	
	if(fs.existsSync(Constants.root + "/build/client")) {
		app.use(express.static(Constants.root + '/build/client'));
	} else {
		app.use(express.static(Constants.root + '/fwk/client'));
	}
	app.use(express.static(Constants.project.home + '/client'));
	
	if(!fs.existsSync(Constants.project.home + "/client/common")) {
		app.use(express.static(Constants.root + '/build/assets'));
	}

    app.engine('ejs', engine);

	if(fs.existsSync(Constants.project.home + "/view")) {
		app.set('views', Constants.project.home + "/view");
	} else {
		app.set('views', Constants.root + "/fwk/view");
	}
    
    app.set('view engine', 'ejs');
    app.set('view options', { layout: true });

	app.use(express.cookieParser());
	app.use(express.methodOverride());

    app.use(express.json());
    app.use(express.urlencoded());

	app.use(express.session({
		secret: config.session_secret,
		store: new ConnectMongo({
			url: config.db,
			collection: "sessions",
			options: {
				auto_reconnect: false
			}
		})
	}));

	app.use(passport.initialize());
	app.use(passport.session());
	app.use(flash());
	app.use(helpers(pkg.name));

	if(Constants.csrf_enabled) {
	    console.log("CSRF filter enabled");
		app.use(express.csrf());
		app.use(function(req, res, next) {
			res.locals.csrf_token = req.csrfToken();
			next();
		});
	} else {
		console.log("WARN: CSRF filter disabled");
	}

    app.use(partials());
	app.use(app.router);
};
