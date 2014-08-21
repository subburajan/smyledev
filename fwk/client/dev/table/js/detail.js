
$(document).ready(function() {
	
	var order = window.location.href.indexOf("order=1") > -1;
	
	var seqRenderer = order? function(data, type, row) {
			data = "";
			return "<div style='width: 100px;height: 22px;background-color: #333;color: #FFF;cursor: pointer'\
			 onclick='changeSeq(this)' _id='" + row[0] + "'>" + data + "</div>";
		}: function(data, type, row) {
			return data;
		}
	
	var arg = "?order=1";
	
	var butt = order? {
	   		title: "Show Ordered",
	   		fn: function() {
	   			var url = window.location.href;
	   			window.location = url.substring(0, url.length - arg.length);
	   		}
	   	}: {
	   		title: "Reset Ordering",
	   		fn: function() {
	   			window.location = window.location.href + arg;
	   		}
	   	};
	
	DetailTableForm.init({
		URI: "/dev/table",
		obj: _obj,
		title: "Table " + _obj.name,
		immutable: false,
		sets: [{
			title: "Basic Information",
			fields: [
 				{ id: "name", name: "Name", immutable: true,
					 type: "string",   itype: "text", required: true },
					 
		 		{ id: "reader", name: "Read Permission", 
					 type: "string",   itype: "subset_ext", required: true,
					 args: { uri: "/dev/role" } },	
					 
	 			{ id: "writer", name: "Write Permission",
					 type: "string",   itype: "subset_ext", required: true,
					 args: { uri: "/dev/role" } },

	 			{ id: "creator", name: "Create Permission",
					 type: "string",   itype: "subset_ext", required: false,
					 args: { uri: "/dev/role" } },
					 
				{ id: "active", name: "Active", immutable: true,
					 type: "string",   itype: "bool", required: true },

				{ id: "writeOwner", name: "Write Owner",
					 type: "string",   itype: "bool", required: true },

				{ id: "readOwner", name: "Read Owner", 
					 type: "string",   itype: "bool", required: true }
			]
		}, {
			
			title: "Fields Configuration",
			fields: [
 				{ id: "_unique", name: "Unique Field", 
					 type: "string",   itype: "select_ext", required: false, 
					 args: { uri: "/dev/field", params: "par=" + _obj._id } },

 				{ id: "_opt", name: "Selector Field", 
					 type: "string",   itype: "subset_ext", required: false, 
					 args: { uri: "/dev/field", params: "par=" + _obj._id } },

				{ id: "_seq", name: "Sequence", args: { default: false },
					 type: "string",   itype: "bool", required: false }
			]
		}],
		
		//"id _type _req isArray _ref _enum _seq ui_detlnk " + 
			//	"ui_name ui_inp_args ui_itype ui_jq_width ui_jq_pop_sel ui_jq_search",
		tableForms: [{
			id: "fields",
			parent_id: _obj._id,
			title: "Field",
			URI: "/dev/field",
			jq: {
				url: "/jqtable/dev/table/" + _obj._id + "/fields",
				cols: [
					{ "sTitle": "Seq", "mRender": seqRenderer },
					{ "sTitle": "ID", "mRender": JQF.detail("/dev/field") },
		            { "sTitle": "Name", "mRender": JQF.detail("/dev/field")  },
	 	            { "sTitle": "Data Type", "mRender": JQF.enum(Enums.DataTypes) },
		            { "sTitle": "UI Data Type" },

		            { "sTitle": "UI Type", "mRender": JQF.enum(Enums.InpTypes) },

		          	{ "sTitle": "Many", "mRender": JQF.bool() },
		            { "sTitle": "Required", "mRender": JQF.bool() },

		            { "sTitle": "Search", "mRender": JQF.enum(Enums.SearchTypes) }
		    	],
		    	
		   	},
	       	
		   	butts: [ butt ],
		   	
	       	manage: {
	       		fields: [				
			 		{ id: "oi", name: "Seq", 
						 type: "+N",   itype: "text", required: true, dataInd: 1 },
						 
					{ id: "id", name: "ID", 
						 type: "string",   itype: "text", required: true, dataInd: 2 },
	
			 		{ id: "ui_name", name: "Name", 
						 type: "string",   itype: "text", required: true, dataInd: 3 },
					
		 			{ id: "_type", name: "Data Type", type: "+N",
		 				itype: "enum_select", args: { enum: Enums.DataTypes }, dataInd: 4,
						changeIf: "ui_itype", changeOn: function(val, inp, fromInp) {
							if(val && getEnumByValue(Enums.InpTypes, val).addInfo.isEnum) {
								inp.setValue(Enums.DataTypes.NUMBER.value);
							}
						}
		 			},
					
		 			{ id: "ui_type", name: "UI Data Type", type: "string", itype: "text", 
		 				changeIf: "_type", changeOn: function(val, inp, fromInp) {
		 					if(val) {
		 						var e = getEnumByValue(Enums.DataTypes, val);
		 						var t = e.addInfo.vt;
		 						if(val == Enums.DataTypes.NUMBER.value) {
		 							var v = DetailTableForm.getTableForm().getInp("ui_itype").getValue();
		 							if(v && getEnumByValue(Enums.InpTypes, v).addInfo.isEnum) {
										t = "+N";
									}
		 						}
		 						inp.setValue(t);
		 					}
		 				}, dataInd: 5
		 			},	
					
		 			{ id: "ui_itype", name: "UI Type", 
						type: "string",   itype: "enum_select", required: true, dataInd: 6,
						args: { enum: Enums.InpTypes },
						changeIf: "_type", changeOn: function(val, inp, fromInp) {
		 					if(val && val == Enums.DataTypes.DATE.value) {
	 							inp.setValue(Enums.InpTypes.DATE.value);
		 					}
		 				}
		 			},

					{ id: "_isArray", name: "Many", dataInd: 7,
						type: "boolean", itype: "bool", args: { default: false },
			 			changeIf: "ui_itype", changeOn: function(val, inp, fromInp) {
		 					if(val) {
		 						var e = getEnumByValue(Enums.InpTypes, val);
		 						inp.setValue(e.addInfo.isArray && true);
		 					}
		 				}
					},
					
					{ id: "_req", name: "Must/Required Field", dataInd: 8,
						type: "boolean", itype: "bool", args: { default: false } },						
					
					{ id: "ui_jq_search", name: "Search", 
						 type: "+N",   itype: "enum_select", required: false, dataInd: 9,
						 args: { enum: Enums.SearchTypes } }
	       		]
	       	}
		}]
	});
	
});

var max = 0;

function changeSeq(obj) {
	var rowid = obj.getAttribute("_id");
	var seq = ++max;
	$.ajax({
		url: "/dev/field/" + rowid,
		type: "post",
		data: "data=" + JSON.stringify({ oi: seq }),
		success: function(res) {
			$(obj).html(seq);
		}
	});
}
