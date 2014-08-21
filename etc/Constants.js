
var _ = require("underscore");

var fs = require("fs");
var path = require("path");


/**
 *
 * Constants  
 */
var Constants = {
	ENV: null,
	config: null,
	csrf_enabled: false,
	root: path.resolve(__dirname + "/.."),
	
	init: function() {
		var PROJECT = process.env.SMYLE_APP || read_dot_smyle();
		var PROJ_ROOT = path.resolve(__dirname + "/../app/" + PROJECT);

		this.ENV = process.env.NODE_ENV || "development";
		this.csrf_enabled = process.env.CSRF_ENABLED && true;
		
		var db = PROJ_ROOT + "/etc/db", P;
		if(fs.existsSync(db + ".js")) {
			P = require(db);
		} else {
			console.log("Invalid project configuration: missing db.js")
			process.exit(-1);
		}
		this.config = P.getCfg(this.ENV);
		
		this.project = P.getArgs();
		this.project.home = PROJ_ROOT;
	
		var enumPath = PROJ_ROOT + "/etc/enum";
		if(fs.existsSync(enumPath + ".js")) {
			this.Enums = _.extend(this.Enums, require(enumPath));
		}

		var rolePath = PROJ_ROOT + "/etc/role";
		if(fs.existsSync(rolePath + ".js")) {
			var Role = require(rolePath);
			this._RA = Role.access;
			this.Enums.Roles = _.extend(this.Enums.Roles, Role.roles);
		}
		
		if(fs.existsSync(rolePath + "_ext.js")) {
			require(rolePath + "_ext")(this.Enums.Roles);
		}
		
		buildMenuVsTitle();
		
		console.log("Project: " + this.project.title);
	},
	
	getRoleCfg: function(roleInd) {
		return menuCfg[roleInd];
	},
	
	getUserHomeURI: function(roleInd) {
		return menuCfg[roleInd].menus[0][1];
	},
	
	getEnumByValue: function(e, val) {
		for(var k in e) {
			if(e[k].value == val) {
				return e[k];
			}
		}
		return null;
	},
	
	getRoleAccess: function(roleInd) {
		return this._RA[roleInd];
	}
};

Constants.Enums = require("./enum");

module.exports = Constants;


//--------------------------------------------------------------------------------
//		Menu Vs Titles
//--------------------------------------------------------------------------------


function read_dot_smyle() {
	var filename = Constants.root + "/.smyle";
	var project_name = fs.readFileSync(filename, 'utf8');
	return project_name.trim();
}

var menuCfg = [];
function buildMenuVsTitle() {
	var roles = Constants.Enums.Roles;
	for(var k in roles) {
		var r = roles[k];
		menuCfg[r.value] = {
			menus: r.addInfo,
			titles: uriVsTitle(r.addInfo)
		};
		delete r.addInfo;
	}
}

function uriVsTitle(menus) {
	var l = menus.length;
	var map = { };
	
	for(var i = 0; i < l; i++) {
		var menu = menus[i];
		var arr = menu[1];
		if(typeof(arr) == "string") {
			map[menu[3]] = menu[0];
			continue;
		}
		var m = arr.length;
		for(var j = 0; j < m; j++) {
			var submenu  = arr[j];
			map[submenu[3]] = menu[0] + " - " + submenu[0]; 
		}
	}
	return map;
}