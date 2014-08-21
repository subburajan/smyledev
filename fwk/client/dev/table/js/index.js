
$(document).ready(function() {
	
	
	parallel([
		function(cb) {
			$.ajax({
				type: "GET",
				url: "/dev/page/all/deep?f=table,title",
				success: function(r) {
					r = $.parseJSON(r);
					var data = (r.status == "OK")? r.message: [];
					var map = {};
					$.each(data, function(i, d) {
						var arr = map[d.table._id];
						if(!arr) {
							arr = map[d.table._id] = [d];
						} else {
							arr.push(d);
						} 
					});
					cb(false, map);
				}
			});
		},
		function(cb) {
			$.ajax({
				type: "GET",
				url: "/dev/validate_table",
				success: function(r) {
					r = $.parseJSON(r);
					var map = (r.status == "OK")? r.message: {};
					cb(false, map);
				}
			});
		}
	], function(err, arr) {
		init(arr[0], arr[1]);
	});
});
	
function init(map1, map2) {	
	var form = TableForm.init({
		title: "Table",
		URI: "/dev/table",
		jq: {
			cols: [
	            { "sTitle": "Name", "mRender": JQF.detail("/dev/table")  },
	            { "sTitle": "Fields", "mRender": JQF.obj_arr("ui_name", 100), "sWidth": "200px"  },
	            { "sTitle": "Read Permission", "mRender": JQF.obj_arr("name")  },
	            { "sTitle": "Write Permission", "mRender": JQF.obj_arr("name") },
	            { "sTitle": "Active",  "mRender": JQF.bool() },
	            { "sTitle": "WR Owner",  "mRender": JQF.bool() },
	            { "sTitle": "RD Owner",  "mRender": JQF.bool() },
	            { "sTitle": "Pages", "mData": null, "mRender": 
	            	function(data, type, row) {
						var arr = map1[row[0]];
						if(!arr || arr.length == 0) {
							return "-";
						}
						var html = [];
						$.each(arr, function(i, a) {
							var txt = "<a href='/dev/page/detail/" + a._id + "'>" + a.title + "</a>";
							html.push(txt);
						});
						return html.join(",");
	            	}
	         	},
				{ "sTitle": "Error or Message", "mData": null, "mRender": 
					function(data, type, row) {
						var invalid = map2[row[0]];
						if(!invalid) {
							return "-";
						}
						var err = [];
						if(invalid[0]) {
							err.push("Not Ordered"); 
						}
						if(invalid[1]) {
							err.push("No Link");
						}
						return "<span class='err'>" + err.join(", ") + "</span>";
					}
				}
	    	],
	    	links: [{
	    		title: "Publish", 
	    		url: "/dev/publish/table" 
	    	}]
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
					 type: "string",   itype: "text", required: true, dataInd: 1 },
					 
		 		{ id: "reader", name: "Read Permission", 
					 type: "string",   itype: "subset_ext", required: true, dataInd: 3,
					 args: { uri: "/dev/role" } },	
					 
	 			{ id: "writer", name: "Write Permission", 
					 type: "string",   itype: "subset_ext", required: true, dataInd: 4,
					 args: { uri: "/dev/role"  } },	
					 
				{ id: "active", name: "Active", 
					 type: "string",   itype: "bool", required: true, dataInd: 5 },

				{ id: "writeOwner", name: "Write Owner", default: false,
					 type: "string",   itype: "bool", required: true, dataInd: 6 },

				{ id: "readOwner", name: "Read Owner", default: false,
					 type: "string",   itype: "bool", required: true, dataInd: 7 }
       		]
       	},
       	
	   	butts: [{
	   		title: "Publish",
	   		url: "/dev/publish/table"
	   	}]
	});
	
	
	var noOrder = 0, noLink = 0;
	for(var k in map2) {
		var v = map2[k];
		if(v[0]) {
			noOrder++;
		}
		if(v[1]) {
			noLink++;
		}
	}
	var c = noOrder + noLink;
	c > 0 && form.setMsg(true, "Tables Not Orderd = " + noOrder + ", Not Linked = " + noLink);

}

