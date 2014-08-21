
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SeqSchema = new Schema({
	name: { type: String, required: true },
	num:  { type: Number, required: true, "default": 0 }
});

SeqSchema.statics.increment = function (counter, callback) {
  return this.collection.findAndModify({ name: counter }, 
  			[], { $inc: { next: 1 } }, { "new": true, upsert: true }, callback);
};

var SeqMO = mongoose.model("Seq", SeqSchema);


module.exports = {
	
	addCrMd: function(schema, fn) {
		schema.pre('save', function(next) {
			if(this.isNew) {
				this.created = Date.now();
				fn && fn(this);
			}
			this.modified = Date.now();
			return next();
		});
	},
	
	addCr: function(schema) {
		schema.pre('save', function(next) {
			if(this.isNew) {
				this.created = Date.now();
			}
			return next();
		});		
	},
	
	addCrMdSNum: function(schema, model, seq) {
		var self = this;
		schema.pre('save', function(next) {
			this.modified = Date.now();
			if(this.isNew) {
				this.created = Date.now();
				if(this.snum != undefined) {
					return next();
				}
				var obj = this;
				self.getNextSeqNum(seq, function(err, count) {
					obj.snum = count || -1;
					next();
				});
			} else {
				return next();
			}
		});
	},
	
	getNextSeqNum: function(seq, next) {
		SeqMO.increment(seq, function(err, count) {
			if(count) {
				return next(false, count.next);
			}
			return next(err);
		});
	},
	
	addUniqueChecker: function(schema, model, field, fieldName) {
		schema.path(field).validate(function(val, done) {
			if(this.isNew || this.isModified(field)) {
				var args = {};
				args[field] = val;
				model.find(args).exec(function(err, list) {
					done(!err && list.length == 0);
				});
			} else {
				done(true);
			}
		}, fieldName + ' already exists');		
	}
	
};
