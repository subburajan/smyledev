
var mongoose = require('mongoose');
var NoteMO = mongoose.model("Note");

var _ = require("underscore");

var Abstract = require("./_Abstract");

function Note() {
	Abstract.apply(this, arguments);
}

_.extend(Note.prototype, Abstract.prototype, {
	
	getOrdered: function(objId, cb) {
		this.model.find({ objId: objId }).sort("-created").
				select("msg created crBy").populate({ path: "crBy", select: "name" }).exec(function(err, result) {
			if(err) {
				return cb("No Data Found");
			}
			cb(false, result);
		});		
	}
	
});

module.exports = new Note(NoteMO);
