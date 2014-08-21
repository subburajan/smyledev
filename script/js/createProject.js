
var ProjectMgr = require(__dirname + "/../../fwk/server/manager/project");

var REGEX = /^[$A-Z_][0-9A-Z_$]*$/i;

var st = main();

if(!st) {
	process.exit(-1);	
}

function main() {
	var argv = process.argv;
	if(argv.length < 4) {
		console.log("Usage> createProject <project-name> <project-title>");
		return false;
	}
	
	return createProject(argv[2], argv[3]);
}

function createProject(pname, ptitle) {
	if(!validate(pname)) {
		console.log("Invalid Project name '" + pname + "'");
		return false;
	}
	
	var fs = require("fs");
	var path = require("path");
	var proj_home = path.resolve(__dirname + "/../app/" + pname);
	if(fs.existsSync(proj_home)) {
		console.log("Project already exists");
		return false;
	}

	ProjectMgr.create(pname, ptitle);
	
	return true;
}

function validate(pname) {
	return REGEX.test(pname);
}
