
var fs = require("fs");
var path = require("path");
var ejs = require("ejs");

var ROOT = __dirname + "/../../..";

var temp_path = path.resolve(ROOT + "/etc/templates");

var Util = require(ROOT + "/fwk/server/common/Util");

module.exports = {
	create: function(pname, ptitle) {
		var proj_home = getProjectHome(pname);
	
		fs.mkdirSync(proj_home);
		fs.mkdirSync(proj_home + "/client");
		fs.mkdirSync(proj_home + "/client/common");
		
		fs.mkdirSync(proj_home + "/etc");
		fs.mkdirSync(proj_home + "/server");
		
		ptitle = ptitle || "Unknown";
		
		compileTo(temp_path + "/db.ejs", { name: pname, title: ptitle }, proj_home + "/etc/db.js");
		Util.copyFile(temp_path + "/project.ejs", proj_home + "/project.js");
		
		var src = ROOT + "/fwk/assets/common/";
		var dest = proj_home + "/client/common/";
		
		Util.copyDir(src, dest, "images");
		Util.copyDir(src, dest, "css");
		
		updateCommon(proj_home);

		Util.copyDir(ROOT + "/fwk/view/", proj_home + "/view/", "local");
		Util.copyFile(ROOT + "/fwk/view/index.ejs", proj_home + "/view/index.ejs");
	},
	
	update: function(proj_home) {
		updateCommon(proj_home);
	}
};

function getProjectHome(pname) {
	return path.resolve(ROOT + "/app/" + pname);
}

function updateCommon(proj_home) {	
	var src = ROOT + "/fwk/view/";
	var dest = proj_home + "/view/";
	if(!fs.existsSync(dest)) {
		fs.mkdirSync(dest);
	}
				
	Util.copyDir(src, dest, "fwk", true);
	Util.copyFile(src + "/layout.ejs", dest + "/layout.ejs");
}

function compileTo(template, args, p) {
	var str = fs.readFileSync(template, 'utf8');
	var data = ejs.render(str, args);
	
	fs.writeFileSync(p, data);
}
