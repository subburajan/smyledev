

module.exports = function() {
	var Constants = require("../../../etc/Constants");
};

module.exports.mail = {
	
	send: function(data, cb) {
		cb(false, "Successfully sent");
	}
	
};
