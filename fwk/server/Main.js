
var cluster = require("cluster");

var count = require("os").cpus().length;	

if(count > 1 && cluster.isMaster) {
	
	for(var i = 0; i < count; i++) {
		cluster.fork();
	}

	cluster.on('listening', function(worker, address) {
		console.log("Worker " + worker.id + " is listening on " +
			address.address + ":" + address.port);
	});

	cluster.on("exit", function(worker, code, signal) {
		console.log("Worker " + worker.id + " is stopped");
	});

	console.log("Trustlr Application Server Started Successfully");

} else {
	require("./app.js")(cluster);
}
