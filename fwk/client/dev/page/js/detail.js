
$(document).ready(function() {
	
	$.ajax({
		url: "/dev/validate_page/" + _obj._id,
		type: "GET",
		success: function(res) {
			res = $.parseJSON(res);
			var form = init();
			if(res.status != "OK") {
				return form.setMsg(true, "Server Internal Error");
			}
			var errFields = res.message || [];
			if(errFields && errFields.length > 0) {
				form.setMsg(true, "Add New Fields | Missing required fields | " + errFields.join(", "));
			}
		}
	});

});

function init() {
	return DetailTableForm.init({
		URI: "/dev/page",
		obj: _obj,
		title: "Page " + _obj.title,
		sets: [{
			title: "Basic Information",
			
			fields: [
 				{ id: "title", name: "Title", 
					 type: "string",   itype: "text", required: true },

				{ id: "table", name: "Table", immutable: true, 
					 type: "string",   itype: "select_ext", 
					 args: { uri: "/dev/table" }, required: true },	

				{ id: "active", name: "Active", 
					 type: "string",   itype: "bool", required: true },

				{ id: "isTablePage", name: "Table Page", 
					 type: "string",   itype: "bool", required: true },

				{ id: "pageType", name: "Page Type", type: "+N", itype: "enum_select",
					args: { enum: Enums.PageTypes }, required: true }
			]
		}, {
			title: "Fields Selection",
			
			fields: [
				{ id: "jq_fields", name: "Table Fields",  changeIf: "table",
					 type: "string",  itype: "subset_ext",  
					 args: { uri: "/dev/field", filter: "par" } },
			
				{ id: "man_fields", name: "Add New Fields", changeIf: "table",
					 type: "string",  itype: "subset_ext",  
					 args: { uri: "/dev/field", filter: "par" } }
			]
		}, {
			title: "External script file",
			
			fields: [
				{ id: "index_ext", name: "Table page script", 
					 type: "string",   itype: "text", required: false },
			
				{ id: "detail_ext", name: "Detail page script", 
					 type: "string",   itype: "text", required: false },

				{ id: "new_ext", name: "New page script", 
					 type: "string",   itype: "text", required: false }
			]
		}],

		tableForms: [{
			id: "tlinks",
			parent_id: _obj._id,
			title: "Links",
			URI: "/dev/page/" + _obj._id + "/tlinks",
			jq: {
				url: "/jqtable/dev/page/" + _obj._id + "/tlinks",
				cols: [
					{ "sTitle": "Title" },
					{ "sTitle": "Url" },
					{ "sTitle": "Href", "mRender": JQF.bool() },
					{ "sTitle": "Roles", "mRender": JQF.obj_arr("name") },
					{ "sTitle": "Field", "mRender": JQF.obj("ui_name") },
					{ "sTitle": "Param", "mRender": JQF.obj_arr("ui_name") },
					{ "sTitle": "Type", "mRender": JQF.enum(Enums.LinkOptions) }
		    	]
		   	},
	       	manage: {
	       		fields: [				
					{ id: "title", name: "Title", 
						 type: "string",   itype: "text", required: true, dataInd: 1 },

					{ id: "url", name: "Url", 
						 type: "string",   itype: "text", required: true, dataInd: 2 },
	
					{ id: "href", name: "Href", default: true, 
						 type: "string",   itype: "bool", required: true, dataInd: 3 },

			 		{ id: "roles", name: "Roles", 
						 type: "string",   itype: "subset_ext", required: true, dataInd: 4,
						 args: { uri: "/dev/role" } },

					{ id: "field", name: "For Field", required: false,
						 type: "string",  itype: "select_ext",  
						 args: { uri: "/dev/field", params: "par=" + _obj.table._id }, dataInd: 5 },

					{ id: "params", name: "Parameter Field", required: false,
						 type: "string",  itype: "subset_ext",  
						 args: { uri: "/dev/field", params: "par=" + _obj.table._id }, dataInd: 6 },

					{ id: "type", name: "Link Option", type: "+N", itype: "enum",
						args: { enum: Enums.LinkOptions }, required: false, dataInd: 7 }
	       		]
	       	}
		}, {
			id: "det_sets",
			parent_id: _obj._id,
			title: "Detail Field Sets",
			URI: "/dev/page/" + _obj._id + "/det_sets",
			jq: {
				url: "/jqtable/dev/page/" + _obj._id + "/det_sets",
				cols: [
					{ "sTitle": "title" },
		            { "sTitle": "fields", "mRender": JQF.obj_arr("ui_name")  }
		    	]
		   	},
	       	manage: {
	       		fields: [				
					{ id: "title", name: "Title", 
						 type: "string",   itype: "text", required: true, dataInd: 1 },
	
					{ id: "fields", name: "Fields", 
						 type: "string",  itype: "subset_ext",  
						 args: { uri: "/dev/field", params: "par=" + _obj.table._id }, dataInd: 2 }		 		
	       		]
	       	}
		}, {
			id: "det_jq_sets",
			parent_id: _obj._id,
			title: "Detail Jquery Field Sets",
			URI: "/dev/page/" + _obj._id + "/det_jq_sets",
			jq: {
				url: "/jqtable/dev/page/" + _obj._id + "/det_jq_sets",
				cols: [
		            { "sTitle": "ID field", "mRender": JQF.obj_detail("ui_name", "/dev/field")  },
		            { "sTitle": "Unique field", "mRender": JQF.obj_detail("ui_name", "/dev/field")  },
		            { "sTitle": "title" },
		            { "sTitle": "Table fields", "mRender": JQF.obj_arr("ui_name")  },
		            { "sTitle": "Add New fields", "mRender": JQF.obj_arr("ui_name")  }
		    	]
		   	},
	       	manage: {
	       		fields: [
					{ id: "id_field", name: "ID Field", required: true,
						 type: "string",  itype: "select_ext",  
						 args: { uri: "/dev/field", params: "par=" + _obj.table._id }, dataInd: 1 },

					{ id: "unique", name: "Unique Field", required: true,
						 type: "string",  itype: "select_ext",  
						 args: { uri: "/dev/field", params: "par=" + _obj.table._id }, dataInd: 2 },

					{ id: "title", name: "Title", required: true,
						 type: "string",   itype: "text", required: true, dataInd: 3 },
	
					{ id: "jq_fields", name: "Table Fields", required: true,
						 type: "string",  itype: "subset_ext",  
						 args: { uri: "/dev/field", params: "par=" + _obj.table._id }, dataInd: 4 },
	
					{ id: "man_fields", name: "Add New Fields", 
						 type: "string",  itype: "subset_ext",  
						 args: { uri: "/dev/field", params: "par=" + _obj.table._id }, dataInd: 5 }	
	       		]
	       	}
		}]
	});
	
}
