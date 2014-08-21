
function newRole() {
	var map = {
		value: arguments[0],
		text: arguments[1],
		addInfo: arguments[2]
	};
	return map;
}

module.exports = {

	DEVELOPER: newRole(1, "Developer", [
		[ "Roles", "/dev/role", 2, "role" ],
		[ "Constants", "/dev/enum", 2, "enum" ],
		[ "Fields", "/dev/field", 2, "field" ],
		[ "Tables", "/dev/table", 2, "_table" ],
		[ "Pages", "/dev/page", 2, "page" ],
		[ "Menus", "/dev/menu", 2, "menu" ]
	]),
	
	ADMIN: newRole(2, "Admin", [
		[ "Users", "/admin/user", 2, "user" ]
	]),
	
	PUBLIC: newRole(-1, "Public", [

	])

};