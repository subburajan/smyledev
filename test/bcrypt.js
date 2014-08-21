

module.exports = {
	genSalt: function(factor, cb) {
		cb(false, 10);
	},

	hash: function(pwd, salt, cb) {
		cb(false, pwd);
	},

	compare: function(p1, p2, cb) {
		if(p1 == p2) {
			cb(false, true);
		} else {
			cb("Password doesn't match", false);
		}
	}
};
