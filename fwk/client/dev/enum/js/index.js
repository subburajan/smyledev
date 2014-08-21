
$(document).ready(function() {
	
	TableForm.init({
		title: "Constants",
		URI: "/dev/enum",
		jq: {
			cols: [
				{ "sTitle": "Name", "mRender": JQF.detail("/dev/enum") },
	            { "sTitle": "Values", "mRender": JQF.obj_arr("text", 100) },
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
				{ id: "name", name: "Name", 
					 type: "string",   itype: "text", required: true, dataInd: 1 }
       		]
       	},
       	
       	butts: [{
       		title: "Publish",
       		url: "/dev/publish/enum"
       	}]
	});
});

