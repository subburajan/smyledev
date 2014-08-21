
var mongoose = require('mongoose');
var AppPropsMO = mongoose.model("AppProps");

function commonCB(cb) {
	return function(err, result) {
		if(err || !result) {
			cb(null);
		} else {
			cb(result.value);
		}
	};	
}

module.exports = {
	
	getCFG: function(name, cb) {
		AppPropsMO.findOne({ name: name }).select("value").exec(commonCB(cb));
	},
	
	setCFG: function(name, value, cb) {
    	AppPropsMO.update({ name: name }, 
    		{ name: name, value: value }, { upsert: true }, 
    			commonCB(cb));
	},
	
	getAll: function(cb) {
		AppPropsMO.find({}, function(err, result) {
			cb(err? {}: result);
		});	
	},
	
    getFormatVer: function(cb) {
    	this.getCFG("formatver", cb);
    },
    
    setFormatVer: function(revision, cb) {
    	this.setCFG("formatver", revision, cb);
    }

};

