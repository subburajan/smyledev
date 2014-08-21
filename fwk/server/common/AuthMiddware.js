
var Constants = require("../../../etc/Constants");
var Util = require("./Util");

function _isAjax(req) {
	return req.headers['x-requested-with'] == 'XMLHttpRequest';
}

var PUBLIC = Constants.Enums.Roles.PUBLIC;
var PUBLIC_ROLE = PUBLIC.value;

module.exports = {
	forRoles: function(read, write) {
		var self = this;
		return function(req, res, next) {
	        var roles = (req.method == "POST" && write)? write: read;
	        var isAuth = req.isAuthenticated();
	        var isAjax = _isAjax(req);

	        if(!isAuth) {
	        	if(roles.indexOf(PUBLIC_ROLE) > -1) {
	        		return next();
	        	}
	        	return isAjax?
	        		Util.returnResponse("Session Expired", null, res): 
	        		res.redirect("/login");
	        }
	        var u = req.user;
	        
	        var denied = roles.indexOf(u.role) == -1;
	        
	        if(isAjax) {
	        	if(denied) {
	        		return Util.returnResponse("Permission Denied", null, res);
	        	}
	        	res.locals.user = u;
	        	return next();
	        }
        	
		    confAuth(req, res, function() {
	        	if(denied) {
	        		return res.render("fwk/common/error", {
						err: "Permission Denied"
					});	
	        	}
	        	next();		    	
		    });
		};
	},
	
	common: function() {
		return required;
	},
	
	useIfExists: function() {
		return useIfExists;
	}
	
};

function required(req, res, next) {
    if(!req.isAuthenticated()) {
    	return res.redirect("/login");
    }
    confAuth(req, res, next);
};

function useIfExists(req, res, next) {
    if(!req.isAuthenticated()) {
		res.locals = getPageInfo(req.path, PUBLIC);
    	return next();
    }
    confAuth(req, res, next);
};

function confAuth(req, res, next) {
	var u = req.user;

    var Role = Constants.getEnumByValue(Constants.Enums.Roles, u.role);
    if(!Role) {
    	return res.redirect("/servermaint");
    }
    u.lias = Role.text;

	var map = getPageInfo(req.path, Role);
	map.user = u;
	
	res.locals = map;
	
	next();
}

function getPageInfo(url, Role) {
	url = url.split("?")[0].split("/");
	var pmenu = url[url.length - 1] || url[url.length - 2];
	
	var cfg = Constants.getRoleCfg(Role.value);
	var title = cfg.titles[pmenu];

	return {
		pmenu: pmenu,
		title: title,
		menus: cfg.menus,
		page_title: title
	};
}
