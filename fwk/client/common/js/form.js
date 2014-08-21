
var Form = (function() {

	function Form(cfg) {
		this.cfg = cfg;
		this.inps = [];
		this.init();
		return this;
	}
	
	Form.prototype = {
	    init: function() {
	
	    },
	
	    getMap: function() {
	        var data = {};
	        var i;
	        var isNew = this.cfg.isNew;
	        $.each(this.inps, function(ind, i) {
	        	if(i.isVisible() && (isNew || i.isDirty())) {
	        		i.map(data);
	        	}
			});
	        return data;
	    },
	    
	    getData: function() {
	        var data = {};
	        var i;
	        var isNew = this.cfg.isNew;
	        $.each(this.inps, function(ind, i) {
	        	i.map(data);
			});
	        return data;	    	
	    },
	
	    getJSON: function() {
	        var data = [];
	        $.each(this.inps, function(ind, i) {
				data.push(i.getJSON());
			});
	        return "{" + data.join(",") + "}";
	    },
	
	    validate: function() {
			var valid = true;
			var self = this;
			$.each(this.inps, function(ind, i) {
				if(i.isVisible()) {
					valid &= i.validate(self);
				}
			});
			return valid;
	    },
	
	    populate: function(data) {
			$.each(this.inps, function(ind, i) {
				i.populate(data);
			});
		},
	
	    clear: function() {
			$.each(this.cfg.fields, function(ind, i) {
				i.clear();
			});
		},
		
		isDirty: function() {
			var dirty = false;
			$.each(this.inps, function(ind, i) {
				if(i.isVisible() && i.isDirty()) {
					dirty = true;
					return false;
				}
			});
			return dirty;
		},
	
	    save: function(cb, beforeAjax) {
	    	this.setErr("");
	        if(!this.validate()) {
	        	this.setErr("One or more Field values are incorrect, Please check");
	            return;
	        }
	        if(!this.isDirty()) {
	        	this.setErr("Nothing is changed");
	        	return;
	        }
	        var map = this.getMap();
	        var bs = this.cfg.beforeSave;
	        if(bs) {
	        	var self = this;
	        	bs(map, function(map) {
	        		if(map) {
	        			self._save(map, cb, beforeAjax);
	        		}	
	        	});
	        } else {
	        	this._save(map, cb, beforeAjax);
	        }
		},
		
		_save: function(map, cb, beforeAjax) {
			var data = JSON.stringify(map);
	        data = "data=" + escape(encodeURIComponent(data));
	       	beforeAjax && beforeAjax();
	       	var url = this.cfg.url;
	       	if(this.cfg.pid) {
	       		url += "?parent=" + this.cfg.pid;
	       	}
	        $.ajax({
	        	type: "POST",
	            url: url,
	            data: data,
	            success: function(response) {
					response = JSON.parse(response);
					if(response.status == "OK") {
		                cb(map, response.message);
					} else{
						cb(false, response.reason);
					}
				},
				error: function(err) {
					cb(false, {
						err: "Server Unreachable"
					});
				}
	        });
	    },
	
	    addInput: function(cfg) {
			var clazz = INPUT_TYPES[cfg.itype];
			var inp = new clazz(cfg);
			this.inps.push(inp);
			return cfg.inp = inp;
		},
		
		remove: function(cb) {
			var data = { method: "delete", id: this.cfg.id };
			data = "data=" + escape(JSON.stringify(data)),
	        $.ajax({
	            type: "POST",
	            url: this.cfg.url,
	            data: data,
	            success: function(response) {
					response = JSON.parse(response);
					cb(response);
	            }
	        });
		},

		setEditable: function(editable) {
	        $.each(this.inps, function(ind, i) {
				i.setEditable(editable);
			});
		},
		
		rollback: function() {
	        $.each(this.inps, function(ind, i) {
				i.rollback();
			});			
		},
		
		destroy: function() {
	        $.each(this.inps, function(ind, i) {
				i.destroy();
			});
		},
		
		resetOldValues: function() {
	        $.each(this.inps, function(ind, i) {
				i.resetOldValue();
			});
		},
		
		setErr: function(err) {
			this.cfg.errHandler && this.cfg.errHandler(err);
			//abstract
		}
	};
	
	return Form;

})();
