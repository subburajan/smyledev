
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SchemaUtil = require("../common/SchemaUtil");

var Util = require("../common/Util");

var ActivationSchema = new Schema({
	targetid: { type: Schema.Types.ObjectId, required: true },

	code: { type: Number, 'default': 0 },
	
	created: { type: Date  },
	modified: { type: Date }
});
   
SchemaUtil.addCrMd(ActivationSchema, function(obj) {
	obj.code = Util.random(10000);
});

var model = mongoose.model("Activation", ActivationSchema);

