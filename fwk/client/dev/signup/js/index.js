
$(document).ready(function() {
	var pwdNote = "Password should be at least 8 characters and at least one of each: alphabet/symbol/number";
	
	NewForm.init({
		title: "Signup",
		URI: "/signup",
		sets: [{
			title: "Basic Information",
       		fields: [
				{ id: "name", name: "Full Name", 
					 type: "name",   itype: "text", required: true },
				{ id: "email", name: "Email", 
					 type: "email",   itype: "text", required: true },
				{ id: "password", name: "Password", 
					 type: "pwd",   itype: "text", required: true, sample: pwdNote },
				{ id: "password1", name: "Re Enter Password", 
					 type: "pwd",   itype: "text", required: true, sample: pwdNote, validator: "=password" },
				{ id: "role", name: "Role", 
					 type: "string",    itype: "enum", required: true,
					 	args: { enum: _obj.Roles, selInd: 1 }}
       		]
       	}],
       	beforeSave: function(data, cb) {
       		delete data["password1"];
       		cb(data);
       	}
	});
});

