
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NoteSchema = new Schema({
	objId: { type: Schema.Types.ObjectId, required: true },
	msg:  { type: String, required: true },

	crBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },
	created: { type: Date }
});
   
var SchemaUtil = require("../common/SchemaUtil");

SchemaUtil.addCr(NoteSchema);

var model = mongoose.model("Note", NoteSchema);

model.paginate = require("../common/Paginate")(model);

