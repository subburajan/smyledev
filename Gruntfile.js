
var fs = require("fs");
var path = require("path");
var readline = require("readline");

var home_dir = path.resolve(__dirname);
var app_dir;

function getApp() {
	var filename = home_dir + "/.smyle";
	if(!fs.existsSync(filename)) {
		return;
	}
	var project_name = fs.readFileSync(filename, 'utf8');
	return project_name.trim();	
}

module.exports = function(grunt) {
	var app = getApp();
	app_dir = home_dir + "/app/" + app;
	
	grunt.initConfig({
		clean: [ "build" ],
		uglify: {
			build: {
				files: [{
					expand: true,
					src: [ "client/**/*.js", "!client/lib/**" ],
					dest: "build/",
					cwd: home_dir + "/fwk"
				}]
			}
		},
		
		cssmin: {
			minify: {
				expand: true,
				src: [ "client/**/*.css", "!client/lib/**" ],
				dest: "build/",
				cwd: home_dir + "/fwk"		
			},
			app: {
				expand: true,
				src: [ "common/**/*.css" ],
				dest: app_dir + "/client",
				cwd: app_dir + "/client",
				ext: ".min.css"
			}
		},
		
		copy: {
			main: {
				files: [ {
				    expand: true,
				    cwd: home_dir + "/fwk/client/lib",
				    src: [ "**/*" ],
				    dest: "build/client/",
				    filter: 'isFile'
				} 
			]
		}}
		
	});
	
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat')
	grunt.loadNpmTasks('grunt-contrib-clean');;
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	
	grunt.registerTask('default', ["clean", "copy", "cssmin:minify", 'uglify']);
	
	grunt.registerTask('app', [ 'default', "cssmin:app", 'view_min' ]);
	
	grunt.task.registerTask("view_min", "Compressing " + app + " views", function(arg1, arg2) {
		grunt.task.run("cssmin")
		processViews(grunt);
	});
	
}


function processViews(grunt) {
	var view_path = home_dir + "/fwk/view/fwk/hdrs";
	
	grunt.file.recurse(view_path, function(abspath, rootdir, subdir, filename) {
		processView(grunt, abspath, filename);
	});
	
	grunt.task.run("concat");
}


var START = "<!-- $smyle-start";
var END = "$smyle-end -->";

function processView(grunt, p, f) {
	grunt.log.writeln("#Processing: " + f);
	
	var str = grunt.file.read(p);
	
	var i = str.indexOf(START);
	if(i == -1) {
		return;
	}
	var j = str.indexOf(END);
	if(j == -1) {
		return;
	}
	j += END.length;
	var cnt = str.substring(i, j);
	
	try {
		var js_arr = getJsFiles(cnt);
		var css_arr = getCssFiles(cnt);
	} catch(e) {
		grunt.log.writeln("ERR: " + e);
		throw e;
	}

	f = f.substring(0, f.lastIndexOf("."));
	
	var gen = "";
	if(css_arr.length > 0) {
		gen = "<link type=\"text/css\" rel=\"stylesheet\" href=\"/hdrs/css/" + f + ".css\">";
	}
	if(js_arr.length > 0) {
		gen += "\n<script src=\"/hdrs/js/" + f + ".js\"></script>";
	}
	
	if(gen.length == 0) {
		return;
	}
	
	var data = str.substring(0, i) + gen + str.substring(j);

	//writing ejs
	var out_path = app_dir + "/view/fwk/hdrs";
	grunt.file.mkdir(out_path);	
	grunt.file.write(out_path + "/" + f + ".ejs", data);
	
	var cwd = home_dir + "/build/client/";
	
	//adding concat tasks
	if(css_arr.length > 0) {
		grunt.config("concat." + f + "-css", {
			src:  prefixPath(cwd, css_arr),
			dest: app_dir + "/client/hdrs/css/" + f + ".css"
		});
	}
	
	if(js_arr.length > 0) {
		grunt.config("concat." + f + "-js", {
			src:  prefixPath(cwd, js_arr),
			dest: app_dir + "/client/hdrs/js/" + f + ".js"
		});
	}
}

function prefixPath(cwd, arr) {
	var arr1 = [];
	arr.forEach(function(a) {
		if(fs.existsSync(cwd + a)) {
			arr1.push(cwd + a);
		} else {
			var np = app_dir + "/client" + a;
			if(!fs.existsSync(np)) {
				console.log("missing: " + a + "\n " + np);				
			}
			
			var i = np.lastIndexOf(".");
			var npmin = np.substring(0, i) + ".min.css";
			if(fs.existsSync(npmin)) {
				arr1.push(npmin);
			} else {
				arr1.push(np);				
			}
		}
	});
	return arr1;
}

function getJsFiles(str) {
	return filter(getFiles(str, "<script ", " src="));
}

function getCssFiles(str) {
	return filter(getFiles(str, "<link ", " href="));
}

function filter(arr) {
	var arr1 = [];
	arr.forEach(function(a) {
		arr1.push(a);
	});
	return arr1;
}

function getFiles(str, TAG, ATTR) {
	var arr = [];
	var JS = "<script ";
	var i = str.indexOf(TAG);
	while(i != -1) {
		var j = str.indexOf(ATTR);
		if(j == -1) {
			return arr;
		}
		j += ATTR.length;
		var ch = str.charAt(j);
		str = str.substring(j + 1);
		var file = str.substring(0, str.indexOf(ch));
		arr.push(file);
		i = str.indexOf(TAG);
	}
	
	return arr;
}
