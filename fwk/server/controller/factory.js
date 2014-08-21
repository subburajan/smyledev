
var _ = require("underscore");

var mongoose = require("mongoose");

var Abstract = require("./_Abstract");

var Map = {};

module.exports = function(modelName, protoMap) {
	var name = modelName.toLowerCase();
	var cntrl = Map[name];
	if(cntrl) {
		return cntrl;
	}
	
	var model = mongoose.model(modelName);
	cntrl = _.extend({ model: model }, Abstract.prototype, protoMap);
	Map[name] = cntrl;
	
	return cntrl;
};

