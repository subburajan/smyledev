
$(document).ready(function() {

	DetailTableForm.init({
		URI: "/dev/menu",
		obj: _obj,
		title: "Menu " + _obj.name,
		sets: [{
			title: "Basic Information",
			fields: [
	 			{ id: "par", name: "Role", immutable: true,
					 type: "string",   itype: "select_ext", required: true,
					 args: { uri: "/dev/role", selInd: 0 } },	
					 
				{ id: "oi", name: "Sequence", type: "+N", itype: "text" },
				
				{ id: "name", name: "Name", 
					 type: "string",   itype: "text", required: true },
					 
				{ id: "pageid", name: "Page Id", 
					 type: "string",   itype: "select_ext",
					 args: { uri: "/dev/page" }, required: false },

				{ id: "tablePage", name: "Table Page", 
					 type: "string",   itype: "select_ext",
					 args: { uri: "/dev/page" }, required: false },

				{ id: "pageuri", name: "Page URI", 
					 type: "string",   itype: "text", required: false },
					 
				{ id: "active", name: "Active", 
					 type: "string",   itype: "bool", required: true }
			]
		}],

		tableForms: [{
			id: "childs",
			parent_id: _obj._id,
			title: "Sub Menus",
			URI: "/dev/menu/" + _obj._id + "/childs",
			jq: {
				url: "/jqtable/dev/menu/" + _obj._id + "/childs",
				cols: [
		            { "sTitle": "Sequence" },
		            { "sTitle": "Name", "mRender": JQF.detail("/dev/menu")  },
		            { "sTitle": "pageid", "mRender": JQF.obj_detail("title", "/dev/page")  },
		            { "sTitle": "tablePage", "mRender": JQF.obj_detail("title", "/dev/page")  },
					{ "sTitle": "Page URI" },
		            { "sTitle": "Active",  "mRender": JQF.bool() }
		    	]
		   	},
	       	manage: {
	       		fields: [
					{ id: "oi", name: "Sequence", type: "+N", itype: "text", dataInd: 1 },
					
					{ id: "name", name: "Name", 
						 type: "string",   itype: "text", required: true, dataInd: 2 },
						 
					{ id: "pageid", name: "Page Id", 
						 type: "string",   itype: "select_ext",
						 args: { uri: "/dev/page" }, required: false, dataInd: 3 },

					{ id: "tablePage", name: "Table Page", 
						 type: "string",   itype: "select_ext",
						 args: { uri: "/dev/page" }, required: false, dataInd: 4 },

					{ id: "pageuri", name: "Page URI", 
						 type: "string",   itype: "text", required: false, dataInd: 5 },
						 
					{ id: "active", name: "Active", 
						 type: "string",   itype: "bool", required: true, dataInd: 6 }						 
	       		]
	       	}
		}]
	});
	
});
