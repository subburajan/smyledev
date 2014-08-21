
$(document).ready(function() {
	
	TableForm.init({
		title: "Roles",
		URI: "/dev/role",
		jq: {
			cols: [
	            { "sTitle": "Seq" },
	            { "sTitle": "Role Name", "mRender": JQF.detail("/dev/role") },
	            { "sTitle": "Menus", "mRender": JQF.obj_arr("name") },
	            { "sTitle": "Active",  "mRender": JQF.bool() }
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
	 			{ id: "seq", name: "Sequence", 
					 type: "+N",   itype: "text", required: true, dataInd: 1 },	
					 
	 			{ id: "name", name: "Role Name", 
					 type: "string",   itype: "text", required: true, dataInd: 2 },	

				{ id: "active", name: "Active", 
					 type: "string",   itype: "bool", required: true, dataInd: 4 }					 
       		]
       	},
	   	butts: [{
	   		title: "Recreate Project",
	   		url: "/dev/project/update"
	   	}, {
	   		title: "Publish",
	   		url: "/dev/publish/role"
	   	}]
	});
});

