
var SubsetEditor = (function() {
	
	function Subset(cfg) {
		this.cfg = cfg;
		return this;
	}
	
	$.extend(Subset.prototype, {
		render: function(id, cntrid) {
			var cz = this.cfg.pos ? "subset subset-" + this.cfg.pos: "subset";
			var div = $("<div class='" + cz + "'></div>");
			$("#" + cntrid).append(div);
			this.div = div;
		},
		
		load: function(opts) {
			var self = this;
			$.each(opts, function(i, opt) {
				self.add(opt);
			});
		},
		
		add: function(opt, index) {
			var e = $("<div class='subset-opt'><span class='so-val'>" +
				 opt.text + "</span></div>");
				
			e.attr("val", opt.val);
			var cfg = this.cfg;
			
			link('remove', "Remove");
			link('add', "Add");
			
			if(index == undefined) {
				this.div.append(e);	
			} else {
				this.div.append(e);	
			}
			
			function link(key, title) {
				if(cfg[key]) {
					var e1 = $("<a class='so-action' href='javascript:void(0)'>" + title +  "</a>");
					e1.on("click", function(evt) {
						var e = $(evt.target.parentNode);
						cfg[key](getOptFromElem(e));
						e.remove();			
					});
					e.append(e1);
				}
			}
		},
		
		getValues: function() {
			var vals = [];
			var elems = this.div.find(".subset-opt");
			$.each(elems, function(i, e) {
				vals.push(getOptFromElem($(e)));
			});
			return vals;
		},
		
		count: function() {
			return this.div.find(".subset-opt").length;
		},
		
		clear: function() {
			this.div && this.div.html("");
		}
	});
	
	function getOptFromElem(e) {
		return {
			val: e.attr("val"), text: e.find(".so-val").html()
		};
	}
	
	function SubsetEditor(cfg) {
		this.cfg = cfg;
		this.init();
		return this;
	}
	
	$.extend(SubsetEditor.prototype, {
	
		init: function() {
			var self = this;
			this.sel = new Subset({
				remove: function(opt) {
					self.set.add(opt);
				},
				pos: "left"
			});
			this.set = new Subset({
				add: function(opt) {
					self.sel.add(opt);
				},
				pos: "right"
			});
		},
	
		render: function(id) {
			this.cntrid = id;
			this.sel.render(id + "_sel", id);
			this.set.render(id + "_set", id);
			$("#" + id).append("<div class='clear'></div>");
		},
		
		loadSel: function(sel) {
			this.sel.clear();
			this._oldValue = sel;
			this.sel.load(sel);
			this.loadSet(this._all || []);
		},
		
		loadSet: function(all) {
			this.set.clear();
			
			var sel = this.sel.getValues();
			var i = 0;
			var set = this.set;
			$.each(all, function(i, opt) {
				var found = false;
				$.each(sel, function(i, opt1) {
					if(opt1.val == opt.val) {
						found = true;
						return false;
					}
				});
				if(!found) {
					set.add(opt);
				}
			});
			this._all = all;
		},
		
		resetOptions: function(opts, selOpts) {
			this._oldValue = selOpts || [];
			this._all = opts;
			this._resetOldValues();
		},
		
		isDirty: function() {
			var ov = this._oldValue;
			var nv = this.getValues();
			if(nv.length != ov.length) {
				return true;
			}
			var dirty = false;			
			$.each(ov, function(i, opt) {
				var found = false;
				$.each(nv, function(i, opt1) {
					if(opt1.val == opt.val) {
						found = true;
						return false;
					}
				});
				if(!found) {
					dirty = true;
					return false;
				}
			});
			return dirty;
		},
		
		_resetOldValues: function() {
			this.loadSel(this._oldValue);
			this.loadSet(this._all);
		},
		
		getValues: function() {
			return this.sel.getValues();
		}
	});
	
	$(document).ready(function() {
		
		if(INPUT_TYPES == undefined) {
			return;	
		}
		
		var TextInp = INPUT_TYPES.text;
		
		function SubsetInp() {
			TextInp.apply(this, arguments);
		}
		
		$.extend(SubsetInp.prototype, TextInp.prototype, {
			_html: function() {
				return "<div id='" + this.id + "' class=''></div>";
			},
			
			doAfterRender: function(e, args) {
				var id = this.id;
				this._ed = new SubsetEditor({
					id: id
				});
				this._ed.render(id);
				this._valid_limit = args.valid_limit;
				args.opts && this.loadOpts(args.opts);
			},
			
			populate: function(data) {
	   			var arr = data[this.cfg.id];
	   			if(arr && arr.length > 0) {
	   	   			var newarr = [];
	   	   			var all = this._ed._all;
	       			$.each(all, function(i, a) {
	       				if(arr.indexOf(a.val) > -1) {
	       					newarr.push(a);
	       				}
	    			});
	       			data[this.cfg.id] = newarr;
	   			}
	   			TextInp.prototype.populate.apply(this, arguments);
	   		},
			
			isDirty: function() {
				return this._ed.isDirty();
			},
			
			getValue: function() {
				var arr = this._ed.getValues();
				var out = [];
				$.each(arr, function(i, a) {
					out.push(a.val);
				});
				return out;
			},
			
			setValue: function(opts) {
				/*var all = this.cfg.args.opts;
				var opts = [];
				arr && $.each(arr, function(i, a) {
					$.each(all, function(i, opt) {
						if(opt.val == a) {
							opts.push(opt);
							return false;
						}
					});
				});*/
				this._ed.loadSel(opts || []);
			},
			
			loadOpts: function(opts) {
				this._ed.loadSet(opts);
			},
			
			resetOptions: function(all, selOpts) {
				var newarr = [];
				if(selOpts) {
					var arr = [];
					$.each(selOpts, function(i, so) {
						arr.push(so.val);
					});
					$.each(all, function(i, a) {
		       			if(arr.indexOf(a.val) > -1) {
		       				newarr.push(a);
		       			}
		    		});	
				}
				this._ed.resetOptions(all, newarr);
			},
			
			isEmpty: function() {
				return this._ed.sel.count() == 0;	
			},
			
			rollback: function() {
				this._ed._resetOldValues();
				this.setErr("");
			},
			
			resetOldValue: function() {
				this._ed._oldValue = this._ed.getValues();
				this._ed._resetOldValues();
				this._resetDispVal();
			},
			
			getOldDispText: function() {
				return this._dispText(this._ed._oldValue);
			},
			
			getDispText: function() {
				return this._dispText(this._ed.getValues());
			},
			
			_dispText: function(val) {
				var html = [];
				$.each(val, function(i, v) {
					html.push(v.text);
				});
				return html.join(", ");
			},
							
			_validate: function() {
				var limit = this._valid_limit;
				if(limit) {
					var count = this._ed.sel.count();
					if(limit[0] != "*" && count < limit[0]) {
						return this.setErr("Please select atleast " + limit[0] + " values ");
					} 
					if(limit[1] != "*" && count > limit[1]) {
						return this.setErr("Should not select more than " + limit[1] + " values");
					}	
				}
				return true;
			},
			
			destroy: function() {
				delete this._ed;
			}
		});
		
		INPUT_TYPES.subset = SubsetInp;

		
		function EnumSubsetInp(cfg) {
			var arr = [];
			var e = cfg.args.enum;
			for(var k in e) {
				var v = e[k];
				arr[v.value - 1] = { text: v.text, val: v.value };	
			}
			cfg.args.opts = arr;		
			
			SubsetInp.apply(this, arguments);
		}
		
		$.extend(EnumSubsetInp.prototype, SubsetInp.prototype, { });
		
		INPUT_TYPES.enum_subset = EnumSubsetInp;
		
	});
	
	return SubsetEditor;
	
})();

