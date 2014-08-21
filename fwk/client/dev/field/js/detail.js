/* 
 * 
 *	@author Subburajan
 *  @date   March 2014
 */
$(document).ready(function() {
	DetailForm.init({
		URI: "/dev/field",
		obj: _obj,
		title: _obj.par.name + " -> " + _obj.ui_name,
		beforeSave: function(data, cb, form) {
			var i = 0;
			data._ref && (i++);
			data._enum && (i++);
			if(i > 1) {
				var err = "Please select either " + form.getInp("_ref").cfg.name + " or " + 
					form.getInp("_enum").cfg.name;
				return form.setErr(err);
			}
			
			var e = getEnumByValue(Enums.InpTypes, form.getInp("ui_itype").getValue());
			if(e.isEnum &&  form.getInp("_enum").isEmpty()) {
				return form.setErr("Must Select an Enum for Enum type inputs");
			}
			
			cb(data);
		},
		sets: [{
			title: "Basic Information",
			fields: [
    			{ id: "oi", name: "Seq", type: "+N",   itype: "text", required: true },
    			
				{ id: "id", name: "ID", 
					 type: "string",   itype: "text", required: true, immutable: true },

		 		{ id: "ui_name", name: "Name", 
					 type: "string",   itype: "text", required: true },	
				
				{ id: "_type", name: "Data Type", type: "+N",
	 				itype: "enum_select", args: { enum: Enums.DataTypes },
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
	 							var v = DetailForm.getForm().getInp("ui_itype").getValue();
	 							if(v && getEnumByValue(Enums.InpTypes, v).addInfo.isEnum) {
									t = "+N";
								}
	 						}
	 						inp.setValue(t);
	 					}
	 				}
	 			},	
				
	 			{ id: "ui_itype", name: "UI Type", 
					type: "string",   itype: "enum_select", required: true, 
					args: { enum: Enums.InpTypes },
					changeIf: "_type", changeOn: function(val, inp, fromInp) {
	 					if(val && val == Enums.DataTypes.DATE.value) {
 							inp.setValue(Enums.InpTypes.DATE.value);
	 					}
	 				}
	 			},

				{ id: "_isArray", name: "Many", 
					type: "boolean", itype: "bool", args: { default: false },
		 			changeIf: "ui_itype", changeOn: function(val, inp, fromInp) {
	 					if(val) {
	 						var e = getEnumByValue(Enums.InpTypes, val);
	 						inp.setValue(e.addInfo.isArray && true);
	 					}
	 				}
				},
				
				{ id: "_req", name: "Must/Required Field",
					type: "boolean", itype: "bool", args: { default: false } },		 			
				
				{ id: "ui_jq_search", name: "Search", 
					 type: "+N",  itype: "enum_select", required: false, 
					 args: { enum: Enums.SearchTypes } }
			]
		}, {			
			title: "Advanced Settings",
			fields: [				
				
				{ id: "ui_validator", name: "Validator", type: "string", itype: "text" },

				{ id: "ui_default", name: "Default Value", type: "string", itype: "text" },
					 
				{ id: "ui_detlnk", name: "Detail Page Link", 
					type: "boolean", itype: "bool", args: { default: false } },

				{ id: "_enum", name: "Choose if Constant", type: "String", itype: "select_ext", 
					args: { uri: "/dev/enum" } },
				
				{ id: "ui_jq_width", name: "Table Column Width", type: "+N", itype: "text" },
				
				{ id: "_clone", name: "Can Copy", type: "boolean", itype: "bool", args: { default: true } }
			]
		}, {
			title: "Reference Table Relationship",
			fields: [			
				{ id: "_ref", name: "Reference Table", 
					 type: "string",   itype: "select_ext", args: { uri: "/dev/table" } },
					 
				{ id: "ui_jq_pop_sel", name: "Reference Table Fields", showIf: "_ref", changeIf: "_ref",
					 type: "string",  itype: "subset_ext",  
					 args: { uri: "/dev/field", filter: "par" } },
					 
				{ id: "_isParent", name: "Is Parent", type: "boolean", itype: "bool", 
					showIf: "_ref", changeIf: "_ref", args: { default: false } },
					 
				{ id: "_clone_ref", name: "Can Copy Child", type: "boolean", itype: "bool", args: { default: false } },
				
				/*{ id: "_foreign", name: "Foreign Match Field",
					 type: "string",  itype: "select_ext",  
					 args: { uri: "/dev/field", params: "par=" + _obj.par._id } }*/
			]
		}, {
			title: "Child Field Settings",
			fields: [
			
				{ id: "childs", name: "Child Fields",
					 type: "string",  itype: "subset_ext",  
					 args: { uri: "/dev/field", params: "par=" + _obj.par._id } }
			]
		}, {
			title: "Permissions",
			fields: [
			
				{ id: "read_only",  name: "Read only Users", 
					 type: "string",   itype: "subset_ext", required: false,
					 args: { uri: "/dev/role" } },

				{ id: "hidden",  name: "Hidden for Users", 
					 type: "string",   itype: "subset_ext", required: false,
					 args: { uri: "/dev/role" } },

				{ id: "immutable", name: "Immutable", type: "boolean", itype: "bool", args: { default: false } }

			]
		}]
	});
	
});
