
$(document).ready(function() {
	
	TableForm.init({
		title: "Field",
		URI: "/dev/field",
		jq: {
			type: 1,
			cols: [
				{ "sTitle": "Table", "mRender": JQF.obj_detail("name", "/dev/table") },
				{ "sTitle": "Seq" },
				{ "sTitle": "ID", "mRender": JQF.detail("/dev/field") },
	            { "sTitle": "Name", "mRender": JQF.detail("/dev/field")  },
	            { "sTitle": "Data Type", "mRender": JQF.enum(Enums.DataTypes) },
	            { "sTitle": "UI Data Type" },
	            { "sTitle": "UI Type", "mRender": JQF.enum(Enums.InpTypes) },
	            
	          	{ "sTitle": "Many", "mRender": JQF.bool() },
	            { "sTitle": "Required", "mRender": JQF.bool() },

	            { "sTitle": "Search", "mRender": JQF.enum(Enums.SearchTypes) },
	            
	            { "sTitle": "Error or Message", "mData": null, "mRender": 
	            	function(data, type, row) {
	            		// _enum _ref ui_jq_pop_sel
	            		var _enum = row[11];
	            		var _ref = row[12];
	            		var ui_jq_pop_sel = row[13];
	            		
	            		var e = getEnumByValue(Enums.InpTypes, row[7]);
	            		if(e.addInfo.isEnum) {
	            			if(!_enum) {
	            				return "<span class='err'>Enum Not set</span>";
	            			}
	            			if(_ref) {
	            				return "<span class='err'>Cannot be both Enum and Ref</span>";
	            			}
	            			return _enum.name;
	            		}
	            		if(row[5] == Enums.DataTypes.OBJECTID.value) {
	            			if(!_ref) {
	            				return "<span class='err'>Reference not set</span>";
	            			}
	            			if(!ui_jq_pop_sel || ui_jq_pop_sel.length == 0) {
	            				return "<span class='err'>Reference Field population is missing</span>";
	            			}
	            			var arr = [];
	            			$.each(ui_jq_pop_sel, function(i, f) {
	            				arr.push(f.ui_name);
	            			});
	            			return _ref.name + " -> " + arr.join(",");
	            		}
	            		return "";
	            	}
	            }
	    	]
	   	},
       	search: {
       		fields: [
    			{ id: "par", name: "Table Name", type: "string", 
    				itype: "select_ext", args: { uri: "/dev/table"  } },
    			    				
    			{ id: "ui_name", name: "Field Name", type: "string",   itype: "text" },

	 			{ id: "_type", name: "Data Type", type: "+N",
	 				  itype: "enum_select", args: { enum: Enums.DataTypes } },

	 			{ id: "ui_itype", name: "UI Type", 
					 type: "string",   itype: "enum_select",
					 args: { enum: Enums.InpTypes } },
	 			
    			{ id: "_isArray", name: "Many", type: "boolean",   itype: "bool_select" },


    			{ id: "_enum", name: "Enum", type: "string",   itype: "select_ext",
    				args: {
    					uri: "/dev/enum"		
    				}
    			},
    			
    			{ id: "_ref", name: "Reference Table Name", type: "string", 
    				itype: "select_ext", args: { uri: "/dev/table"  } },

    			{ id: "_isParent", name: "Is Parent", type: "boolean",   itype: "bool_select" },
       		]
       	},
       	manage: {
       		fields: [
    			{ id: "oi", name: "Seq", type: "+N",   itype: "text", required: true, dataInd: 2 },
    			
				{ id: "id", name: "ID", 
					 type: "string",   itype: "text", required: true, dataInd: 3 },

		 		{ id: "name", name: "Name", 
					 type: "string",   itype: "text", required: true, dataInd: 4 },	
					 
	 			{ id: "_type", name: "Data Type", type: "+N",
	 				itype: "enum_select", args: { enum: Enums.DataTypes }, dataInd: 5,
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
	 							var v = TableForm.getForm().getInp("ui_itype").getValue();
	 							if(v && getEnumByValue(Enums.InpTypes, v).addInfo.isEnum) {
									t = "+N";
								}
	 						}
	 						inp.setValue(t);
	 					}
	 				}, dataInd: 6
	 			},	
				
	 			{ id: "ui_itype", name: "UI Type", 
					type: "+N",   itype: "enum_select", required: true, dataInd: 7,
					args: { enum: Enums.InpTypes },
					changeIf: "_type", changeOn: function(val, inp, fromInp) {
	 					if(val && val == Enums.DataTypes.DATE.value) {
 							inp.setValue(Enums.InpTypes.DATE.value);
	 					}
	 				}
	 			},

				{ id: "_isArray", name: "Many", dataInd: 8,
					type: "boolean", itype: "bool", args: { default: false },
		 			changeIf: "ui_itype", changeOn: function(val, inp, fromInp) {
	 					if(val) {
	 						var e = getEnumByValue(Enums.InpTypes, val);
	 						inp.setValue(e.addInfo.isArray && true);
	 					}
	 				}
				},
				
				{ id: "_req", name: "Must/Required Field", dataInd: 9,
					type: "boolean", itype: "bool", args: { default: false } },				
				
				{ id: "ui_jq_search", name: "Search", 
					 type: "+N",   itype: "enum_select", required: false, 
					 	args: { enum: Enums.SearchTypes }, dataInd: 10 },
       		]
       	}
	});
});

