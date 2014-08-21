
$(document).ready(function() {
	
	TableForm.init({
		title: "Menu",
		URI: "/dev/menu",
		jq: {
			cols: [
	            { "sTitle": "Role", "mRender": JQF.obj_detail("name", "/dev/role") },
	            { "sTitle": "Sequence" },
	            { "sTitle": "Name", "mRender": JQF.detail("/dev/menu")  },
	            { "sTitle": "pageid", "mRender": JQF.obj_detail("id", "/dev/page")  },
	            { "sTitle": "Table Page", "mRender": JQF.obj_detail("title", "/dev/page")  },
	            { "sTitle": "childs", "mRender": JQF.obj_arr("name") },
	            { "sTitle": "Active",  "mRender": JQF.bool() }
	    	]
	   	},
       	search: {
       		fields: [
    			{ id: "par", name: "Role", type: "string", 
    				itype: "select_ext", args: { uri: "/dev/role" }  },
    			{ id: "name", name: "Name", type: "string",   itype: "text" }
       		]
       	},
       	manage: {
       		fields: [
				{ id: "par", name: "Role", type: "string", itype: "select_ext", 
				  args: {uri: "/dev/role" }, immutable: true, dataInd: 1 },
				
				{ id: "oi", name: "Sequence", type: "+N", itype: "text", dataInd: 2 },
				
				{ id: "name", name: "Name", 
					 type: "string",   itype: "text", required: true, dataInd: 3 },
					 
				{ id: "pageid", name: "Page Id", 
					 type: "string",   itype: "select_ext",
					 args: { uri: "/dev/page" }, required: false, dataInd: 4 },

				{ id: "tablePage", name: "Table Page", 
					 type: "string",   itype: "select_ext",
					 args: { uri: "/dev/page" }, required: false, dataInd: 5 },

				{ id: "active", name: "Active", 
					 type: "string",   itype: "bool", required: true, dataInd: 7 }					 
       		]
       	}
	});
});

