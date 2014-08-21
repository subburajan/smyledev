
var SchemaUtil = require("../common/SchemaUtil");

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var EnumSchema = new Schema({
	name: { type: String, required: true },
	
	values: [{
		name: { type: String },
		value: { type: Number, required: true },
		text: { type: String, required: true }
	}],

	created: { type: Date },
	modified: { type: Date }
});
SchemaUtil.addCrMd(EnumSchema);
var enumModel = mongoose.model("Enum", EnumSchema);
enumModel.paginate = require("../common/Paginate")(enumModel);


var FieldSchema = new Schema({
	par: { type: Schema.Types.ObjectId, required: true, ref: "Table" },
	oi: { type: Number, default: 1 },
	id: { type: String, required: true },
	_type: { type: Number, required: true },
	_req: { type: Boolean, default: false },
	_isArray: { type: Boolean, default: false },
	_ref: { type: Schema.Types.ObjectId, ref: "Table" },
	_enum: { type: Schema.Types.ObjectId, ref: "Enum"  },
	_clone: { type: Boolean, default: true },
	_clone_ref: { type: Boolean, default: false },
	_isParent: { type: Boolean, default: false },
	
	ui_detlnk: { type: Boolean, default: false },
	ui_default: { type: String },
	ui_name: { type: String },
	ui_inp_args: { type: Schema.Types.Mixed },
	ui_itype: { type: Number },
	ui_type: { type: String },
	ui_validator: { type: String },
	ui_showIf: { type: String },
	ui_changeIf: { type: String },
	
	ui_jq_width: { type: String },
	ui_jq_pop_sel: [{ type: Schema.Types.ObjectId, ref: "Field" }],
	ui_jq_search: { type: Number },
	
	/*_foreign: { type: Schema.Types.ObjectId, ref: "Field" },*/
	
	childs: [
		{ type: Schema.Types.ObjectId, ref: "Field" }
	],

	read_only: [
		{ type: Schema.Types.ObjectId, ref: "Role" }
	],
	hidden: [
		{ type: Schema.Types.ObjectId, ref: "Role" }
	],
	
	immutable: { type: Boolean, default: false },
	
	created: { type: Date },
	modified: { type: Date }
});
SchemaUtil.addCrMd(FieldSchema);
var fieldModel = mongoose.model("Field", FieldSchema);
fieldModel.paginate = require("../common/Paginate")(fieldModel);


var TableSchema = new Schema({
	name: { type: String },
	fields: [{
		type: Schema.Types.ObjectId, ref: "Field"
	}],
	
	_unique: { type: Schema.Types.ObjectId, ref: "Field" },
	_seq: { type: Boolean, default: false },
	_opt: [{ type: Schema.Types.ObjectId, ref: "Field" }],
	
	cr: { type: Boolean, default: true },
	crBy: { type: Boolean, default: true },
	mr: { type: Boolean, default: true },
	mrBy: { type: Boolean, default: true },
	
	reader: [ { type: Schema.Types.ObjectId, ref: "Role" } ],
	writer: [ { type: Schema.Types.ObjectId, ref: "Role" } ],
	creator: [ { type: Schema.Types.ObjectId, ref: "Role" } ],

	active: { type: Boolean, default: true },
	writeOwner: { type: Boolean, default: false },
	readOwner: { type: Boolean, default: false },
	
	created: { type: Date },
	modified: { type: Date }
});
SchemaUtil.addCrMd(TableSchema);
var tableModel = mongoose.model("Table", TableSchema);
tableModel.paginate = require("../common/Paginate")(tableModel);


var PageSchema = new Schema({
	title: { type: String, required: true },
	
	id: { type: String, required: true },
	
	table: { type: Schema.Types.ObjectId, required: true, ref: "Table" },
	
	isTablePage: { type: Boolean, default: false },
	
	pageType: { type: Number, default: 1 },
	
	jq_fields: [{
		type: Schema.Types.ObjectId, ref: "Field"
	}],
	
	jq_links: { type: String },
	
	man_fields: [{
		type: Schema.Types.ObjectId, ref: "Field" 
	}],
	
	det_sets: [{
		title: { type: String },
		fields: [{
			type: Schema.Types.ObjectId, ref: "Field"
		}]
	}],

	det_jq_sets: [{
		id_field: { type: Schema.Types.ObjectId, ref: "Field" },
		
		title: { type: String },
		
		unique: { type: Schema.Types.ObjectId, ref: "Field" },

		jq_fields: [{
			type: Schema.Types.ObjectId, ref: "Field"
		}],

		man_fields: [{
			type: Schema.Types.ObjectId, ref: "Field" 
		}],
	}],
	
	tlinks: [ {
		roles: [ { type: Schema.Types.ObjectId, ref: "Role", required: true } ],
		url: { type: String, required: true },
		href: { type: Boolean, required: true, default: true },
		title: { type: String, required: true },
		field: { type: Schema.Types.ObjectId, ref: "Field" },
		params: [ { type: Schema.Types.ObjectId, ref: "Field" } ],
		type: { type: Number, default: 1 }
	}],

	index_ext: { type: String },
	detail_ext: { type: String },	
	new_ext: { type: String },	
	
	active: { type: Boolean, default: true },
	
	created: { type: Date },
	modified: { type: Date }
});
var pageModel = mongoose.model("Page", PageSchema);
SchemaUtil.addCrMd(PageSchema);
SchemaUtil.addUniqueChecker(PageSchema, pageModel, "id", "Id");
pageModel.paginate = require("../common/Paginate")(pageModel);



var MenuSchema = new Schema({
	par: { type: Schema.Types.ObjectId, ref: "Role", required: true },

	oi: { type: Number, required: true },
	
	name: { type: String, required: true },
	
	pageid: { type: Schema.Types.ObjectId, ref: "Page" },
	
	tablePage: { type: Schema.Types.ObjectId, ref: "Page" },
	
	pageuri: { type: String },
	
	childs: [{
		oi: { type: Number, required: true },
		name: { type: String, required: true },
		pageid: { type: Schema.Types.ObjectId, ref: "Page" },
		tablePage: { type: Schema.Types.ObjectId, ref: "Page" },
		pageuri: { type: String },
		active: { type: Boolean, default: true },
	}],
	
	active: { type: Boolean, default: true },
	
	created: { type: Date },
	modified: { type: Date }
});
SchemaUtil.addCrMd(MenuSchema);
var menuModel = mongoose.model("Menu", MenuSchema);
menuModel.paginate = require("../common/Paginate")(menuModel);



var RoleSchema = new Schema({
	seq: { type: Number, required: true },
	
	name: { type: String, required: true },

	roletable: { type: Schema.Types.ObjectId, ref: "Table" },

	tables: [{
		table: { type: Schema.Types.ObjectId, ref: "Table" },
		field: { type: Schema.Types.ObjectId, ref: "Field" },
		foreign: { type: Schema.Types.ObjectId, ref: "Field" }
	}],
	
	menus: [ { type: Schema.Types.ObjectId, ref: "Menu" } ],
	
	active: { type: Boolean, default: true },
	
	created: { type: Date },
	modified: { type: Date }
});
SchemaUtil.addCrMd(RoleSchema);
var roleModel = mongoose.model("Role", RoleSchema);
roleModel.paginate = require("../common/Paginate")(roleModel);

