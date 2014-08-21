
$(document).ready(function() {

	var SelectInp = INPUT_TYPES.select;
			
	function SelectInpExt() {
		SelectInp.apply(this, arguments);
	}
	
	$.extend(SelectInpExt.prototype, SelectInp.prototype, {
		doAfterRender: function(e, args) {
			SelectInp.prototype.doAfterRender.apply(this, [e, args]);
			this.resetOptions();
		},
		
		populate: function(data) {
   			var obj = data[this.cfg.id];
   			if(obj && obj._id) {
   				if(this._loaded) {
   					data[this.cfg.id] = obj._id;
   					SelectInp.prototype.populate.apply(this, [ data ]);
   				} else {
   					this._selOpts = { val: obj._id, text: obj[getFPName(obj)] };	
   				}
       		}
		},
		
		_resetDispVal: function() {
			if(this._selOpts) {
				if(this.cfg.dv_enabled) {
					var cb = this.cfg.dv_callback;
					cb? cb(this): this.resetDispVal();	
				}
			} else {
				SelectInp.prototype._resetDispVal.apply(this, arguments);
			}
		},	
		
		resetOptions: function() {
			var args = this.cfg.args;
			var self = this;
			var sep = args.sep || " ";
			getOpts(args.uri, args.params, function(arr) {
				var opts = [];
				
				var selOpts = self._selOpts;
				
				$.each(arr, function(i, obj) {
					var txt =  obj.slice(1).join(sep);
					opts.push({ val: obj[0], text: txt });
					if(selOpts && selOpts.val == obj[0]) {
						selOpts.text = txt;
					}
				});
				
				self._loaded = true;
				SelectInp.prototype.resetOptions.apply(self, [opts]);
				
				if(selOpts) {
					var data = {};
					data[self.cfg.id] = selOpts.val;
					SelectInp.prototype.populate.apply(self, [ data ]);
					delete self._selOpts;
				}
			});
		},
		
		changeIf: function(val, inp) {
			var args = this.cfg.args;
			if(val) {
				args.params = (args.filter || inp.cfg.id) + "=" + val;
			} else {
				args.params = null;
			}
			this.resetOptions();
		},
		
		getDispText: function() {
			if(this._selOpts) {
				return this._dispText(this._selOpts);
			}
			return SelectInp.prototype.getDispText.apply(this, arguments);
		},
		
		_dispText: function(sel) {
			if(sel && !this.isRejectedValue(sel.val)) {
				return "<a href='" + this.cfg.args.uri + 
							"/detail/" + sel.val + "'>" + sel.text + "</a>";
			}
			return "";			
		},
	});
	
	INPUT_TYPES.select_ext = SelectInpExt;

	function getFPName(a) {
		for(var k in a) {
			if(k != "_id") {
				return k;
			}
		}
		return "_id";
	}	
	
});
