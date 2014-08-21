
$(document).ready(function() {
	$.ajax({
		url: "/dev/validate_page",
		type: "GET",
		success: function(res) {
			res = $.parseJSON(res);
			var map = res.message || { };
			var form = init(map);
			if(res.status != "OK") {
				form.setMsg(true, "Server Internal Error"); 
			} else {
				var c = 0;
				for(var k in map) {
					c++;
				}
				(c > 0) && form.setMsg(false, "Missing fields in " + c + " pages"); 
			}
		}
	});
});

function init(map) {
	return TableForm.init({
		title: "Pages",
		URI: "/dev/page",
		jq: {
			cols: [
	            { "sTitle": "ID", "mRender": JQF.detail("/dev/page"), "mWidth": "50px" },
	            { "sTitle": "title", "mRender": JQF.detail("/dev/page") },
	            { "sTitle": "table", "mRender": JQF.obj_detail("name", "/dev/table") },
	            { "sTitle": "jq_fields", "mRender": JQF.obj_arr("ui_name") },
	            { "sTitle": "man_fields", "mRender": JQF.obj_arr("ui_name") },
	            { "sTitle": "Table Page",  "mRender": JQF.bool() },
	            { "sTitle": "Page Type",  "mRender": JQF.enum(Enums.PageTypes) },
	            { "sTitle": "Active",  "mRender": JQF.bool() },
	            { "sTitle": "Error or Message", "mData": null, "mRender": 
	            	function(data, type, row) {
	        			var fields = map[row[0]];
	        			if(!fields || fields.length == 0) {
	        				return "-";
	        			}
	        			return "<span class='err'>" + fields.join(",") + "</span>";
	        		}
	        	}
	        ],
	    	links: [{
	    		title: "Publish", 
	    		url: "/dev/publish/page" 
	    	}]
	   	},
       	search: {
       		fields: [
    			{ id: "title", name: "title", 
				 type: "string",   itype: "text" }
       		]
       	},
       	manage: {
       		fields: [					 
				{ id: "id", name: "ID", type: "string", itype: "text", dataInd: 1 },
				
				{ id: "title", name: "Title", type: "string", itype: "text", dataInd: 2 },
				
				{ id: "table", name: "Table", immutable: true,
					 type: "string",   itype: "select_ext", 
					 args: { uri: "/dev/table" }, required: true, dataInd: 3 },

				{ id: "isTablePage", name: "Table Page", 
					 type: "string",   itype: "bool", required: true, dataInd: 6 },

				{ id: "pageType", name: "Page Type", type: "+N", itype: "enum_select",
					args: { enum: Enums.PageTypes }, required: true, dataInd: 7 },

				{ id: "active", name: "Active", 
					 type: "string",   itype: "bool", required: true, dataInd: 8 }
       		]
       	},
       	
	   	butts: [{
	   		title: "Publish",
	   		url: "/dev/publish/page"
	   	},{
    		title: "Create Pages", 
    		url: "/dev/project/createPages" 
	    }]
	});
}
