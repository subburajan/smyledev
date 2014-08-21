
var Auth = require("../../common/AuthMiddware");

module.exports = function(app) {
	
	require("./user")(app);
	
};
