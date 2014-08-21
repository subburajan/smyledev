
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AppPropsSchema = new Schema({
	name: { type: String, required: true },
	value: { type: Schema.Types.Mixed, required: true },
	
	crBy: { type: Schema.Types.ObjectId, required: true },
	created: { type: Date },	
	
	mdBy: { type: Schema.Types.ObjectId, required: true },
	modified: { type: Date }
});

var SchemaUtil = require("../common/SchemaUtil");

SchemaUtil.addCrMd(AppPropsSchema);

mongoose.model("AppProps", AppPropsSchema);

