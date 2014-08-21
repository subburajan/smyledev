

module.exports = {
	
	Roles:  require("./role"),
	
	Status: {
		ACTIVE: { value: 1, text: "Active" },
		INACTIVE: { value: 2, text: "InActive" }
	},

	Day: {
		SUN: { value: 1, text: "Sunday" },
		MON: { value: 2, text: "Monday" },
		TUE: { value: 3, text: "Tuesday" },
		WED: { value: 4, text: "Wednesday" },
		THU: { value: 5, text: "Thursday" },
		FRI: { value: 6, text: "Friday" },
		SAT: { value: 7, text: "Saturday" }	
	},
	
	Gender: {
		MALE: { value: 1, text: "Male" },
		FEMALE: { value: 2, text: "FeMale" }
	},
	
	DataTypes: {
		STRING: { value: 1, text: "String", addInfo: { d: "String", vt: "string" } },
		DATE: { value: 2, text: "Date", addInfo: { d: "Date", vt: "date" } },
		NUMBER: { value: 3, text: "Number", addInfo: { d: "Number", vt: "N" } },
		OBJECTID: { value: 4, text: "Reference", addInfo: { d: "Schema.Types.ObjectId", vt: "object" } },
		BOOLEAN: { value: 5, text: "Boolean", addInfo: { d: "Boolean", vt: "boolean" } },
		IMAGE: { value: 6, text: "Image", addInfo: { d: "Schema.Types.Mixed", vt: "object" } },
		OBJECT: { value: 7, text: "Object", addInfo: {  d: "Schema.Types.Mixed", vt: "object" } }
	},
	
	InpTypes: {
		TEXT: { value: 1, text: "Text", addInfo: { d: "text" } },
		TEXTAREA: { value: 2, text: "BigText", addInfo: { d: "textarea" } },
		FILE: { value: 3, text: "File Uploader", addInfo: { d: "file" } },
		BOOL: { value: 4, text: "Yes/No", addInfo: { d: "bool" } },
		IMAGE: { value: 5, text: "Image", addInfo: { d: "image" } },
		SELECT: { value: 6, text: "Select Box", addInfo: { d: "select" }},
		
		DATE: { value: 7, text: "Date", addInfo: { d: "date" } },
		RADIO: { value: 8, text: "Radio Button", addInfo: { d: "radio" } },
		ENUM: { value: 9, text: "Enum", addInfo: { d: "enum", isEnum: true } },
		CHOICE: { value: 10, text: "Add Choice", addInfo: { d: "choice", isArray: true } },
		
		SUBSET: { value: 11, text: "Subset", addInfo: { d: "subset", isArray: true } },
		SUBSET_EXT: { value: 12, text: "Subset Advanced", addInfo: { d: "subset_ext", isArray: true } },
		ENUM_SUBSET: { value: 13, text: "Subset Enum", addInfo: { d: "enum_subset", isArray: true, isEnum: true } },
		SELECT_EXT: { value: 14, text: "Select Advanced", addInfo: { d: "select_ext" }},
		ENUM_SELECT: { value: 15, text: "Select Enum", addInfo: { d: "enum_select", isEnum: true } },
		JQ_TABLE: { value: 16, text: "Jquery Table", addInfo: { isArray: true } },
	},
	
	SearchTypes: {
		EQUALS: { value: 1, text: "Equals to" },
		REGEX: { value: 2, text: "Partial Match" },
		IN: { value: 3, text: "Any one" }
	},

	PageTypes: {
		JQ_DYNAMIC: { value: 1, text: "Jquery Table Dynamic" },
		JQ_FIXED: { value: 2, text: "Jquery Table Fixed" },
		JQ_CHILD: { value: 3, text: "Jquery Child Table " },
		LIST: { value: 4, text: "List View" },
		CALENDAR: { value: 5, text: "Calendar View" },
		TIME_TABLE: { value: 6, text: "Time Table View" }
	},

	LinkOptions: {
		BOTH: { value: 1, text: "Both" },
		TABLE_ONLY: { value: 2, text: "Table Only" },
		DETAIL_ONLY: { value: 3, text: "Detail Only" },
	}
};
