
$(document).ready(function() {

	var SubsetInp = INPUT_TYPES.subset;
	var TextInp = INPUT_TYPES.text;
			
	function SubsetExtInp() {
		SubsetInp.apply(this, arguments);
	}
	
	$.extend(SubsetExtInp.prototype, SubsetInp.prototype, {		
		doAfterRender: function(e, args) {
			SubsetInp.prototype.doAfterRender.apply(this, arguments);
			if(!this.cfg.changeIf) {
				this.resetOptions();	
			}
		},
		
		populate: function(data) {
   			var arr = data[this.cfg.id];
   			if(arr && arr.length > 0) {
   			    var newarr = [];
   			    var fname = this.cfg.args.fname;
       			$.each(arr, function(i, a) {
   					fname || (fname = getFPName(a));	
   					newarr.push({ val: a._id, text: a[fname] });
       			});
       			data[this.cfg.id] = newarr;
       			this._selOpts = newarr;
   			}
   			TextInp.prototype.populate.apply(this, arguments);
		},		
		
		resetOptions: function() {
			var args = this.cfg.args;
			var self = this;
			var sep = args.sep || " ";
			getOpts(args.uri, args.params, function(arr) {
				var all = [];
				var selOpts = self._selOpts;
				
				$.each(arr, function(i, obj) {
					var txt =  obj.slice(1).join(sep);
					all.push({ val: obj[0], text: txt });
					if(selOpts && selOpts.val == obj[0]) {
						selOpts.text = txt;
					}
				});
				
				SubsetInp.prototype.resetOptions.apply(self, [all, self._selOpts]);
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
		
		_dispText: function(val) {
			var html = [];
			var uri = this.cfg.args.uri + "/detail/";
			$.each(val, function(i, v) {
				html.push("<a href='" + uri + v.val + "'>" + v.text + "</a>");
			});
			return html.join(", ");
		},		
		
		/*map: function(data) {
			var arr = SubsetInp.prototype.getValue.apply(this, arguments);
   			if(arr) {
   				newarr = [];
   				$.each(arr, function(i, a) {
   					newarr.push(a.val);
   				});
   				data[this.cfg.id] = newarr;
   			}
		}*/
	});
	
	INPUT_TYPES.subset_ext = SubsetExtInp;
	
	function getFPName(a) {
		for(var k in a) {
			if(k != "_id") {
				return k;
			}
		}
		return "_id";
	}	
		
});
