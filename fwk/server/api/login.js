
var Util = require("../common/Util");

var UserController = require("../controller/user");
var Constants = require("../../../etc/Constants");

module.exports = function(app, passport) {

    app.get('/login', function(req, res) {
        res.render("fwk/public/login", {
        	error: req.flash('error'),
        	layout: false,
        	title: "Login"
        });
    });

    var adminMiddleware = function(req, res, next) { //from admin page
        if(req.body.rememberme) {
            req.session.cookie.maxAge = 2592000000;
        } else {
            req.session.cookie.expires = false;
        }
        next();
    };

    var middleware = function(req, res, next) { //from mobile
        req.session.cookie.maxAge = 2592000000; //30 days
        next();
    };

    app.post('/login', middleware, passport.authenticate('local', {
   		failureRedirect: '/login',
    	failureFlash: true
    }), function(req, res) {
    	var home = Constants.getUserHomeURI(req.user.role) || "servermaint";
		res.redirect("/home");
    });

    app.post("/fpwd", function(req, res) {
		UserController.sendPwdReset(req.body.email, function(err, result) {
			Util.returnResponse(err, result, res);    		
       	});
    });

    app.get("/fpwd/reset/:id", function(req, res) {
		UserController.getUserForPwdReset({
			actid: req.params.id, code: req.query.ac }, function(err, user) {
			if(err || !user) {
				return res.render("fwk/public/activate/fail", {
					title: "Reset Password",
					err: err,
					layout: false
				});
			} 
			res.render("fwk/public/activate/pwdreset", {
				user: user,
				layout: false,
				title: "Reset Password"
			});
       	});
    });

    app.post("/fpwd/reset/:id", function(req, res) {
    	var data = { password: req.body.pwd };
		UserController.updateCascade(req.params.id, data, function(err, result) {
			Util.returnResponse(err, result, res);    		
       	});
    });

    app.get("/logout", function(req, res) {
        req.logout();
        if(req.query.ajax) {
            res.send("OK");
        } else {
            res.redirect("/login");
        }
    });
};

