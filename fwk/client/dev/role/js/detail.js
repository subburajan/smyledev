
$(document).ready(function() {

	var dtf = DetailTableForm.init({
		URI: "/dev/role",
		obj: _obj,
		title: "Role " + _obj.name,
		sets: [{
			title: "Basic Information",
			fields: [
				{ id: "seq", name: "Sequence", 
					 type: "+N",   itype: "text", required: true },
				
				{ id: "name", name: "Name", 
					 type: "string",   itype: "text", required: true },

				{ id: "roletable", name: "Role Table", 
					 type: "string",   itype: "select_ext", args: { uri: "/dev/table" }, required: true },
					 
				{ id: "active", name: "Active", 
					 type: "string",   itype: "bool", required: true }
			]
		}],

		tableForms: [{
			id: "menus",
			parent_id: _obj._id,
			title: "Menus",
			URI: "/dev/menu",
			jq: {
				url: "/jqtable/dev/role/" + _obj._id + "/menus",
				cols: [
		            { "sTitle": "Sequence" },
		            { "sTitle": "Name", "mRender": JQF.detail("/dev/menu")  },
		            { "sTitle": "Active",  "mRender": JQF.bool() }
		    	]
		   	},
	       	manage: {
	       		fields: [
					{ id: "oi", name: "Sequence", type: "+N", itype: "text", dataInd: 1 },
					
					{ id: "name", name: "Name", 
						 type: "string",   itype: "text", required: true, dataInd: 2 },

					{ id: "active", name: "Active", 
						 type: "string",   itype: "bool", required: true, dataInd: 3 }						 
	       		]
	       	}
		}, {
			id: "tables",
			parent_id: _obj._id,
			title: "Table Relation",
			URI: "/dev/role/" + _obj._id + "/tables",
			jq: {
				url: "/jqtable/dev/role/" + _obj._id + "/tables",
				cols: [
		            { "sTitle": "Table", "mRender": JQF.obj_detail("name", "/dev/table") },
		            { "sTitle": "Field",  "mRender": JQF.obj_detail("ui_name", "/dev/field") },
		            { "sTitle": "Foreign Key Field",  "mRender": JQF.obj_detail("ui_name", "/dev/field") }
		    	]
		   	},
	       	manage: {
	       		fields: [
					{ id: "table", name: "Table", dataInd: 1,
						 type: "string",   itype: "select_ext", args: { uri: "/dev/table" }, required: true },

					{ id: "field", name: "Field", changeIf: "table", dataInd: 2,
						 type: "string",  itype: "select_ext",  
						 args: { uri: "/dev/field", filter: "par" }, required: false },

					{ id: "foreign", name: "Foreign Key Field", dataInd: 3,
						 type: "string",  itype: "select_ext",  
						 args: { uri: "/dev/field" }, required: false }
	       		],
	       		
	       		beforeEdOpens: function(cfg) {
	       			var form = dtf.getDetailForm();
	       			var inp = form.getInp("roletable");
	       			var table = inp.getValue();
	       			if(table) {
		       			var f = cfg.fields[2];
		       			f.args.params = "par=" + table;	       				
	       			}
	       		}
	       	}
		
		}]
	});
	
});
