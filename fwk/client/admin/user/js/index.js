
$(document).ready(function() {

	TableForm.init({
		title: "User",
		URI: "/admin/user",
		jq: {
			cols: [
	            { "sTitle": "Image", "mRender": JQF.image() },
	            { "sTitle": "Name" },
	            { "sTitle": "Email" },
	            { "sTitle": "Role", "mRender": JQF.enum(Enums.Roles)  },
	            { "sTitle": "Active", "mRender": JQF.bool() }
	    	]
	   	},
       	search: {
       		fields: [
    			{ id: "name", name: "Name", 
				 type: "string",   itype: "text" }
       		]
       	},
       	manage: {
       		fields: [
	 			{ id: "image", name: "Profile Image", 
					 type: "string",   itype: "image", required: true, dataInd: 1 },		
				{ id: "name", name: "Name", 
					 type: "string",   itype: "text", required: true, dataInd: 2 },
				{ id: "email", name: "Email", 
					 type: "email",   itype: "text", required: true, dataInd: 3 },
				{ id: "password", name: "Password", 
					 type: "secret",   itype: "text", required: true },
				{ id: "active", name: "Active", 
					 type: "string",    itype: "bool", required: true,  dataInd: 5 },
				{ id: "role", name: "Role", 
					 type: "string",    itype: "enum", required: true,  dataInd: 4,
					 	args: { enum: Enums.Roles, selInd: 0 }}
       		]
       	}
	});
});

