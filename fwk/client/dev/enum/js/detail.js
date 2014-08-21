
$(document).ready(function() {
	DetailTableForm.init({
		URI: "/dev/enum",
		obj: _obj,
		title: "Constant " + _obj.name,
		sets: [{
			title: "Basic Information",
			fields: [
		 		{ id: "name", name: "Name", 
					 type: "string",   itype: "text", required: true }
			]
		}],

		tableForms: [{
			id: "values",
			title: "Constant Value",
			URI: "/dev/enum/" + _obj._id  + "/values",
			jq: {
				url: "/jqtable/dev/enum/" + _obj._id + "/values",
				cols: [
					{ "sTitle": "Value" },
		            { "sTitle": "Text"  },
		            { "sTitle": "Name" }
		    	]
		   	},
	       	manage: {
	       		fields: [				
					{ id: "value", name: "Value", 
						 type: "+N",   itype: "text", required: true, dataInd: 1 },
	
			 		{ id: "text", name: "Text", 
						 type: "string",   itype: "text", required: true, dataInd: 2 },	
						 
					{ id: "name", name: "Name", 
						 type: "string",   itype: "text", required: true, dataInd: 3 },
	       		]
	       	}
		}]
	});
	
});
