
/**
 * 
 * After installation this will be deattached from routes
 * 
 * @author Subburajan
 * @date   November 2013
 */

var Util = require("../common/Util");
var UserController = require("../controller/user");
var Constants = require("../../../etc/Constants");

var Async = require("async");

module.exports = function(app) {
    
    app.get("/createusers", function(req, res) {
    	var roles = Constants.Enums.Roles;
    	var arr = [];
    	for(var k in roles) {
    		if(k == "PUBLIC") {
    			continue;
    		}
    		arr.push(createUser(k, roles[k]));
    	}
    	
    	Async.parallel(arr, function(err, result) {
    		 Util.returnResponse(err, result, res);    		
    	});
    });

};

function createUser(k, r) {
	return function(cb) {
		UserController.create({
			name: r.text,
			active: true,
			email: k.toLowerCase() + "@smyle.com",
			password: "!N0password1",
			role: r.value
		}, function(err, result) {
			if(err) {
				return cb("Failed: " + k);
			}
			cb(false, "Created: " + k);
		});
	};
}
