
var GeneralForm = (function() {
		
	function GeneralForm(cfg, listView) {
		this.cfg = cfg;
		this.init();
		this.listView = listView;
		return this;
	}
	
	GeneralForm.prototype = {
		init: function() {
			this._id_prfx = this.cfg.id_prfx || "form_";
			this.setTitle(this.cfg.name);
			this._chains = { showIf: {}, changeIf: {} };
			this._init_pers();
			
			var self = this;
			this.form = new Form({
				name: this.cfg.name, 
				url: this.cfg.postURL, 
				beforeSave: function(data, cb) {
					var bs = self.cfg.beforeSave;
					if(self.cfg.isNew !== true) {
						self._mapChains(data);	
					}
					bs? bs(data, cb, self): cb(data);
				},
				validator: this.cfg.validator,
				id: this.cfg.id,
				pid: this.cfg.pid,
				meta: this.cfg.meta,
				isNew: this.cfg.isNew,
				errHandler: function(err) { self.setErr(err); }
			});
			var f = this.cfg.fields = this._filterFields(this.cfg.fields);
			if(f.length > 0) {
				this._renderFields(f);	
			}
			$("#" + this._id_prfx + "cnt").css("display", "block");
		},
		
		_renderFields: function(fields, cntrid) {
			if(!cntrid) {
				cntrid = this._id_prfx + "set1";
				$("#" + this._id_prfx + "cnt").append("<fieldset class='manage-set' id='" + cntrid + "'></fieldset>");
			}
			var dv_enabled = this.cfg.dv_enabled && true;
			var self = this;
			var isNew = this.cfg.isNew;
			$.each(fields, function(ind, field) {
				field.dv_enabled = dv_enabled || field.immutable;
				var inp = self.form.addInput(field);
				inp.render({ container: cntrid }, self);
				self._addToChains(field, "showIf");
				self._addToChains(field, "changeIf");
				
				if(!isNew && field.editable === false) {
					inp.setEditable(false);
				}
			});
		},
		
		_addToChains: function(inpCfg, type) {
			if(!inpCfg[type]) {
				return;
			}
			var chains = this._chains[type];
			var pid = inpCfg[type];
			var arr = chains[pid];
			if(!arr) {
				arr = chains[pid] = [];
			}
			arr.push(inpCfg.id);
		},
		
		addFieldSets: function(sets) {
			var l = sets.length;
			for(var i = 0; i < l; i++) {
				this.addFieldSet(sets[i], "set" + i + "_cnt");
			}
		},
		
		addFieldSet: function(set, id) {
			set.fields = this._filterFields(set.fields);
			var html = "<fieldset class='page-1'><legend><span>" + set.title + 
				"</span></legend><div class='inp-set'><div id='" + id + 
				"'></div></div></fieldset>";
			
			$("#" + this._id_prfx + "cnt").append(html);
			this.addFields(set.fields, id);					
		},
		
		addFields: function(fields, cntrid) {
			this._renderFields(fields, cntrid);
			this.cfg.fields = this.cfg.fields.concat(fields);
		},
	
		setTitle: function(title) {
			$("#" + this._id_prfx + "title").html(title);
		},
		
		populate: function(data) {
			this.form.populate(data);
		},
		
		getData: function() {
			return this.form.getData();
		},
	
		save: function(cb, beforeAjax) {
			var self = this;
			this.form.save(function(data, msg) {
				if(data) {
					var id = self.form.cfg.id;
					self.cancel();
					self.listView && self.listView.add(data);
					cb && cb(data, msg, id);			
				} else {
					self.setErr(msg.err);
				}
			}, beforeAjax);
		},
		
		remove: function(cb) {
			var self = this;
			this.form.remove(function(response) {
				self.cancel();
				cb(response);
			});
		},
	
		cancel: function() {
			this.destroy();
		},
		
		destroy: function() {
			this.setErr("");
			if(this.cfg.fixed) {
				return;
			}
			this.form.destroy();
			this.closed = true;
			$("#" + this._id_prfx + "cnt").html("");
			this.setTitle("");
			delete this.form;
			delete this.cfg;
			this.setVisible(false);		
		},
		
		setVisible: function(visible) {
			$("#" + this._id_prfx + "cnt").css("display", visible ? "block": "none");		
		},
	
		isClosed: function() {
			return this._closed;
		},
	
		setErr: function(msg) {
	        var je = $("#" + this._id_prfx + "err");
	        setMsg(je, true, msg);
		},
		
		setMsg: function(isErr, msg, noautohide) {
	        var je = $("#" + this._id_prfx + "err");
	        setMsg(je, isErr, msg, noautohide);
		},
		
		getField: function(id) {
			var arr = $.grep(this.cfg.fields, function(f) {
				return f.id == id;
			});
			return arr.length > 0 && arr[0];
		},
		
		getInp: function(id) {
			var f = this.getField(id);
			return f && f.inp;
		},
		
		validate: function() {
			return this.form.validate();
		},
		
		setEditable: function(editable) {
			var e = $("#" + this._id_prfx + "cnt");
			if(editable) {
				e.removeClass("immutable");
			} else {
				e.addClass("immutable");
			}
			this.form.setEditable(editable);
		},
		
		rollback: function() {
			this.setErr("");
			this.form.rollback();
		},

		resetOldValues: function() {
			this.form.resetOldValues();
		},
		
		listenChainEvents: function() {
			var self = this;
			for(var type in this._chains) {
				var chains = this._chains[type];
				for(var par in chains) {
					addListnr(par, chains[par], type);
				}
			}

			function addListnr(par, childs, fnName) {
				var pInp = self.getInp(par);
				pInp.addChangeListnr(listnr);
				
				function listnr(val) {
			 		$.each(childs, function(i, child) {
			 			self.getInp(child)[fnName](val, pInp);
			 		});
				}
				if(fnName == "showIf") {
					listnr(null);
				}
			}
		},
		
		_mapChains: function(data) {
			var chains = this._chains.showIf;
			for(var k in chains) {
				if(data[k] === null) {
					var childs = chains[k];
					$.each(childs, function(i, child) {
						data[child] = null;
					});
				}
			}
		},
		
		_filterFields: function(fields) {
			if(!this._checkPer) {
				return fields;
			}
			var arr = [], fn = this._checkPer;
			$.each(fields, function(i, f) {
				if(fn(f)) {
					arr.push(f);	
				}
			});
			return arr;
		},

		
		_init_pers: function() {
			var per = this.cfg.per;
			if(!per) {
				return;
			}
			var pf_cfg = per.fields, ro, hidden;
			if(pf_cfg) {
				ro = pf_cfg[READ_ONLY];
				hidden = pf_cfg[HIDDEN];
			}
			ro = ro || [];
			hidden = hidden || [];
			var unmute = per.unmute || [];
			
			var cfg = this.cfg, fn;
			if(cfg.fixed && !cfg.isNew) {
				fn = function(f) {
					var fid = f.id;
					if(hidden.indexOf(fid) > -1) {
						return false;
					}
					if(unmute.indexOf(fid) > -1 || ro.indexOf(fid) > -1) {
						f.immutable = true;
					}
					return true;
				};	
			} else {
				fn = function(f) {
					f = f.id;
					return !(ro.indexOf(f) > -1 || 
						hidden.indexOf(f) > -1 || unmute.indexOf(f) > -1);
				};
			}
			this._checkPer = fn;
		},
	};
	
	return GeneralForm;

})();

