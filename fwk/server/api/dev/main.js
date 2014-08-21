
var Auth = require("../../common/AuthMiddware");

module.exports = function(app) {

	require("./enum")(app);
	require("./field")(app);
	require("./table")(app);

	require("./page")(app);
	
	require("./menu")(app);
	require("./role")(app);
	
	require("./publish")(app);
	
};
