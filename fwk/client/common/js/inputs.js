
var INPUT_TYPES = (function() {
	
	function TextInp(cfg) {
		this.cfg = cfg;
	    return this;
	}
	
	$.extend(TextInp.prototype, {
	    setValue: function(val) {
	        $("#" + this.id).val(val);
	    },
	
	    getValue: function() {
	        return $("#" + this.id).val();
	    },
	    
	    getValidValue: function() {
	    	return this.isEmpty()? null: this.getValue();
	    },
	
	    getJSON: function() {
	        return this.cfg.id + ": '" + this.getValue() + "'";
	    },
	
	    map: function(data) {
	        data[this.cfg.id] = this.getValue();
	    },
	
		getTypedValue: function() {
			var v = this.getValue();
			if(this.isNumberType()) {
				v = Number(v);
			}
			return v;
		},
		
		isNumberType: function() {
			var type = this.cfg.type;
			return type == "N" || type == "+N" || type == "-N" ||
				type.indexOf("R") == 0 || type.indexOf("N") == 0;	
		},
		
		getDisplayName: function() {
			return this.cfg.name;
		},
	
	    validate: function() {
	       	this.setErr("");
	        if(this.isEmpty()) {
	        	if(this.cfg.required) {
	       			return this.setErr(this._emptyErrMsg());
	       		}
	       		return true;
	        }
	        return this._validate();
	    },
	    
	    _validate: function() {
			try {
				var cv = this.cfg.validator;
				if(cv && typeof(cv) == "function") {
					return cv(this.getValue());
				}
				Validator(this.cfg.type, this.getValue());
				if(cv && typeof(cv) == "string") {
					ExprValidator(this, this.form);
				}
				return true;
			} catch(e) {
				this.setErr(e);
			}
	    },
	
	    _emptyErrMsg: function() {
			return "Must Enter " + this.cfg.name;
		},
		
		isEmpty: function() {
	        var v = this.getValue();		
			return v === "" || v == null || v == undefined;
		},
	
	    setErr: function(msg) {
	        var id = this.id + "_err";
	        var je = $("#" + id);
	        if(msg.length > 0) {
	            if(je.length == 0) {
	                var parent = $("#" + this.id).parent();
	                parent.append("<div class='err' id='" + id + "'>" + msg + "</div>");
	            } else {
	                je.html(msg);
	                je.removeClass("hide");
	            }
	        } else if(je.length > 0) {
	            je.addClass("hide");
	        }
	       	return false;
	    },
	
	    clear: function() {
			this.populate("");
		},
	
		render: function(args, form) {
			this.form = form;
			this.id = args.container + "_" + this.cfg.id;
			if($1(this.id)) {
				throw "Already Rendered";
			}
			var cz = "fields fields-" + this.cfg.id;
			var html = "<div class='" + cz + "' id='" + this.id + "_box'><div><span class='lbl'>" + this.cfg.name +
				 "</span>";
			if(this.cfg.required) {
				html += "<span class='req'>*</span>";
			}
			html += "<span class='disp-val' id='" + this.id + "_dv'></span></div>\
						<div class='inp'>" + this._html(this.cfg.args) + this._sample() || "" + 
				"</div></div>";
			var e = $(html);
			if(args.container) {
				$("#" + args.container).append(e);
			}
			this.doAfterRender(e, this.cfg.args);
			var i = this.cfg.itype;
			var self = this;
			var e = $("#" + this.id);
			e.keypress(function() {
				self.setErr("");
			});
			e.blur(function() {
				self.setErr("");
				if(!self.isEmpty()) {
					self._validate();
				}
			});
			this.cfg.immutable && this.setEditable(false);
			return e;
		},
		
		_sample: function() {
			if(this.cfg.sample) {
				return "<div class='inp-sample'>For Ex. " + this.cfg.sample + "</div>";
			}
		},
	
		_html: function(val) {
			var type = this.cfg.type == "pwd" ? "password": "text";
			return "<input id='" + this.id + "' type='" + type + "' class='txt-field'>";
		},
		
		doAfterRender: function(e, val) {
			this._ov = val || "";
			$("#" + this.id).val(this._ov);
		},
		
		populate: function(map) {
			var nv = map[this.cfg.id];
			this.setValue(nv);
			this._ov = nv;
			this._resetDispVal();
			this.setErr("");
		},
		
		_resetDispVal: function() {
			if(!this.cfg.dv_enabled || this.isEmpty()) {
				this.resetDispVal(" ");
				return;
			}
			var cb = this.cfg.dv_callback;
			cb? cb(this): this.resetDispVal();
		},
		
		resetDispVal: function(val) {
			$("#" + this.id + "_dv").html(val || this.getDispText());
		},
		
		detail_lnk: function(oopt) {
			return this.cfg.detlink  ? 
				"<a href='" + this.cfg.detlink +  "/detail/" + o + "'>" + text + "</a>":
				val;	
		},
		
	 	isDirty: function() {
			return this._ov != this.getValue();
		},
		
		rollback: function() {
			this.setValue(this._ov);
			this.setErr("");
		},
		
		resetOldValue: function() {
			this._ov = this.getValue();
			this._resetDispVal();
		},
		
		setEditable: function(editable) {
			var id = "#" + this.id;
			if(this.cfg.immutable || !editable) {
				setDisplay("none", "inline");
			} else {
				setDisplay("block", "none");
			}
			function setDisplay(v, dv) {
				$($(id).parent()).css("display", v);
				$(id + "_dv").css("display", dv);
			}
		},
		
		getOldDispText: function() {
			return this._ov || "";
		},
		
		getDispText: function() {
			return this.getValue() || "";
		},
		
		setDisplay: function(display) {
			$("#" + this.id + "_box").css("display", display);
		},
		
		isVisible: function() {
			return $("#" + this.id + "_box").css("display") != "none";
		},
				
		showIf: function(val) {
			this.setDisplay(val != null? "block": "none");
		},
		
		changeIf: function(val, inp) {
			this.cfg.changeOn && this.cfg.changeOn(val, this, inp); 
		},
		
		destroy: function() {
			
		}
	});
	
	function SelectInp(args) {
	    return TextInp.apply(this, arguments);
	}
	
	$.extend(SelectInp.prototype, TextInp.prototype, {
		_emptyErrMsg: function() {
			return "Must Select " + this.cfg.name;
		},		
		
		setValue: function(val) {
			var sel = $1(this.id);
			if(val) {
				$.each(sel.options, function(ind, opt) {
					if(opt.value == val) {
						opt.selected = true;
						return false;
					}
				});
			} else {
				sel.selectedIndex = 0;
			}
			if(this._listnrs && this._ov != val) {
				$.each(this._listnrs, function(i, fn) {
					fn(val);
				});
			}
		},
		
		getValue: function() {
			var sel = $1(this.id);
			var i = sel.selectedIndex;
			if(i != -1) {
				var val = sel.options[i].value;
				return val != "-1"? val: null;
			}
		},
		
		_html: function(args) {
			var html = "<select id='" + this.id + "' class='sel-field'>";
			html += "<option value='-1'>Select any</option>";
			if(args) {
				if(args.opts) {
					$.each(args.opts, function(i, opt) {
						html += "<option value='" + opt.val + "' >" + opt.text + "</option>";
					});
				}
				(args.rejectOptVal == undefined) && (args.rejectOptVal = -1);
			}
			return html + "</select>";
		},
	
		doAfterRender: function(e, args) {
			if(args && args.opts) {
				if(args.selected) {
					this._ov = args.selected;
					this.setValue(args.selected);
				} else {
					$1(this.id).selectedIndex = 0;
				}
			}
		},
		
		addChangeListnr: function(fn) {
			if(!this._listnrs) {
				var arr = this._listnrs = [];
				var self = this;
				$("#" + this.id).on("change", function(evt) {
					var sel = evt.target;
					var val = self.getValidValue();
					$.each(arr, function(i, a) {
						a(val);
					});
				});
			}
			this._listnrs.push(fn);
		},
		
		resetOptions: function(opts) {
			var sel = $1(this.id);
			sel.options.length = 0;
			$(sel).append("<option value='-1'>Select any</option>");
			this.addOptions(opts);
			sel.selectedIndex = 0;
		},
		
		addOptions: function(opts) {
			var sel = $("#" + this.id);
			$.each(opts, function(i, opt) {
				sel.append($("<option value='" + opt.val + "'>" + opt.text + "</option>"));
			});
		},
		
		copy: function(inp) {
			var sel = $1(this.id);
			var opts = [];
			var l = sel.options.length;
			for(var i = 0; i < l; i++) {
				var opt = sel.options[i];
				opts.push({ val: opt.value, text: opt.text });
			}
			inp.addOptions(opts);
		},
		
		getSelected: function() {
			var sel = $1(this.id);
			var i = sel.selectedIndex;
			if(i != -1) {
				var opt = $(sel.options[i]);
				return {
					val: opt.attr("value"),
					text: opt.html()
				};
			}
		},
		
		isEmpty: function() {
			var sel = this.getSelected();
			if(sel) {
				return this.isRejectedValue(sel.val);
			}
			return true;
		},
		
		isRejectedValue: function(val) {
			var rv = this.cfg.args.rejectOptVal;
			return rv && rv == val;
		},

		getOldDispText: function() {
			if(!this._ov) {
				return "";
			}
			var sel = $1(this.id);
			var ov = this._ov;
			if(this.isRejectedValue(ov)) {
				return "None";
			}
			var txt = "";
			$.each(sel.options, function(ind, opt) {
				if(opt.value == ov) {
					txt = opt.text;
					return false;
				}
			});
			return txt;
		},
		
		getDispText: function() {
			var sel = this.getSelected();
			return this._dispText(sel);
		},
		
		_dispText: function(sel) {
			if(sel && !this.isRejectedValue(sel.val)) {
				return sel.text;
			}
			return "";			
		},
		
		clear: function() {
			$1(this.id).selectedIndex = 0;
			this.setDisplayValue("");
		}
	});
	
	function EnumSelectInp(cfg) {
		var arr = [];
		var e = cfg.args.enum;
		for(var k in e) {
			var v = e[k];
			arr[v.value - 1] = { text: v.text, val: v.value };	
		}
		cfg.args.opts = arr;		
		
		SelectInp.apply(this, arguments);
	}
	
	$.extend(EnumSelectInp.prototype, SelectInp.prototype, { });
	
	
	function BoolSelectInp(cfg) {
		cfg.args = {};
		cfg.args.opts = [
			{ text: "Yes", val: true },
			{ text: "No", val: false }
		];
		SelectInp.apply(this, arguments);
	}
	
	$.extend(BoolSelectInp.prototype, SelectInp.prototype, { });
	
	function TextAreaInp(args) {
	    return TextInp.apply(this, arguments);
	}
	
	$.extend(TextAreaInp.prototype, TextInp.prototype, {
		_html: function(val) {
			return "<textarea id='" + this.id + "' class='txt-area'></textarea>";
		},
		
		doAfterRender: function(e, val) {
			if(val) {
				val = (this.cfg.type == "Json") ? JSON.stringify(val): val;
				$("#" + this.id).val(val);
				this._ov = val; 
			} else {
				this._ov = "";
			}
		}
	});
	
	function FileInp(cfg) {
	    TextInp.apply(this, arguments);
	    return this;
	}
	
	$.extend(FileInp.prototype, TextInp.prototype, {
		setErr: function(msg) {
	    	this._uploader.setErr(msg);
		},
		
		getValue: function() {
	    	return this._data;
	    },
	    
	    setValue: function(val) {
	   		this._data = val;
		},
		
		getDispText: function() {
			return (this._data && this._data.name) || "";
		},
		
		getOldDispText: function() {
			return (this._ov && this._ov.name) || "";			
		},
	
		map: function(data) {
		    if(this._data) {
		        var d = this._data;
		        data[this.cfg.id] = { name: d.name, id: d.id };
		    }
		},
		
		setEditable: function(editable) {
			TextInp.prototype.setEditable.apply(this, arguments);
			if(editable) {
				this._uploader.showPreview([this._data]);
			} else {
				this._uploader.hidePreview();
			}
		},
		
		isEmpty: function() {
			return this._data == undefined;
		},
		
		clear: function() {
			this._uploader.clear();
			this._data = undefined;
		},

		doAfterRender: function(e, args) {
		    this._uploader = new FileUploader(this._getArgs(args));
		},
		
		_getArgs: function(args) {
			var self = this;
			return {
		    	id: this.id, 
		    	types: (args && args.types) || ["*"],
		    	callback: function(data) {
		        	self.setValue(data);
		      	},
		       	before: args && args.before,
		       	after: args && args.after,
		       	butt_name: (args && args.butt_name) || "Upload",
		       	afterRemove: function(id) {
		       		self._data = null;
		       	}
		   	};
		},

		_html: function(val) {
			return "<input type='file' id='" + this.id + "' name='" + this.id + "'>";
		}
	});
	
	function ImageInp(cfg) {
	    FileInp.apply(this, arguments);
	    return this;
	}
	
	$.extend(ImageInp.prototype, FileInp.prototype, {
		doAfterRender: function(e, args) {
		    this._uploader = new ImageUploader(this._getArgs(args));
		},
		
		setValue: function(value) {
			if(!value) {
				return;
			}
			FileInp.prototype.setValue.apply(this, arguments);
			var args = {};
			args[this.cfg.id] = value;
			if(!this._uploader.isHidden()) {
				this._uploader.showPreview(args);			
			}
		},
		
		resetDispVal: function(val) {
			if(!val) {
				val = this._data ?
					"<div class='fields-disp-image'><img src='/uploader/file/" + this._data.id + "'></div>":
					"-";
			}
			$("#" + this.id + "_dv").html(val);
		}
	});
	
	function DateInp(args) {
	    return TextInp.apply(this, arguments);
	}
	
	$.extend(DateInp.prototype, TextInp.prototype, {
		_html: function(val) {
			return "<input type='text' id='" + this.id + "' class='txt-field date-field' >";
		},
		
		_sample: function() {
			if(!this.cfg.sample) {
				return "<div class='inp-sample'>For Ex. " + DateFormatter.toStr(new Date(), this.cfg.type) + "</div>";	
			}
		},
		
		doAfterRender: function(e, args) {
			this._ov = null;
			TextInp.prototype.doAfterRender.apply(this, arguments);
			$("#" + this.id).datepicker({
				changeMonth: true,
      			changeYear: true
      		});
		},
		
		populate: function(map) {
			var v = map[this.cfg.id];
			if(typeof(v) == "string") {
				map[this.cfg.id] = DateFormatter.utcStrToDate(v);
			}
			TextInp.prototype.populate.apply(this, arguments);
		},
		
		getValue: function() {
			return $("#" + this.id).datepicker("getDate");
		},
		
		setValue: function(val) {
			$("#" + this.id).datepicker("setDate", val);
		},
		
		isDirty: function() {
			var nv = this.getValue();
			var ov = this._ov;
			if(!ov) {
				return true; 
			}
			return !DateFormatter.isSameDate(ov, nv);
		},
		
		destroy: function() {
			$("#" + this.id).datepicker("destroy");
		},
		
		_validate: function() {
			var val = this.getValue();
			if(!val) {
				this.setErr("Invalid Date");
				return false;
			} 
			return true;
		},

		getOldDispText: function() {
			if(!this._ov) {
				return "";
			}
			return DateFormatter.toStr(this._ov, this.cfg.type);
		},
		
		getDispText: function() {
			return $("#" + this.id).val() || "";
		}
	});
	
	function RadioInp(args) {
	    return TextInp.apply(this, arguments);
	}
	
	$.extend(RadioInp.prototype, TextInp.prototype, {
		_html: function(args) {
			var id = this.id;
			var html = "<div id='" + id + "'>";
			var i = 0;
			for(var k in args.values) {
				var v = args.values[k];
				var rid = id + v.val;
				html += "<input type='radio' id='" + rid + "' name='" + id + "' _v='" + v.val + "'>\
					<label for='" + rid + "'>" + v.text + "</label>";
			}
			html += "</div>";
			return html;
		},
		
		doAfterRender: function(e, args) {
			TextInp.prototype.doAfterRender.apply(this, arguments);
			$("#" + this.id).buttonset();
			this._ov = args.values[args.selInd || 0].val;
			this.setValue(this._ov);
		},
		
		getValue: function() {
			var inps = $("#" + this.id + " input");
			var val;
			$.each(inps, function(ind, inp) {
				if(inp.checked) {
					val = inp.getAttribute("_v");
					return false;
				}
			});
			return val;
		},
		
		getSelected: function() {
			var inps = $("#" + this.id + " input");
			var i;
			$.each(inps, function(ind, inp) {
				if(inp.checked) {
					i = ind;
					return false;
				}
			});
			return this.cfg.args.values[i];
		},
		
		setValue: function(val) {
			var id = this.id;
			var values = this.cfg.args.values;
			for(var ind in values) {
				var v = values[ind];
				if(v.val == val) {
					$1(id + val).checked = true;
					$("#" + id).buttonset("refresh");				
					return false;
				}
			}
		},
		
		getOldDispText: function() {
			if(this._ov == undefined) {
				return "";
			}
			var ov = this._ov;
			var txt = "";
			$.each(this.cfg.args.values, function(ind, v) {
				if(v.val == ov) {
					txt = v.text;
					return false;
				}
			});
			return txt;
		},
		
		getDispText: function() {
			return this.getSelected().text;
		}
	});
	
	function EnumInp(cfg) {
		var arr = [];
		var e = cfg.args.enum;
		for(var k in e) {
			var v = e[k];
			arr[v.value - 1] = { text: v.text, val: v.value };	
		}
		cfg.args.values = arr;		
		
		RadioInp.apply(this, arguments);
	}
	
	$.extend(EnumInp.prototype, RadioInp.prototype, { });
	
	
	function BooleanInp(cfg) {
		var arr = [
			{ text: "Yes", val: true },
			{ text: "No", val: false }
		];
		var si = (cfg.args && cfg.args.default === true)? 0: 1;
		cfg.args = { values: arr, selInd: si };		
		
		RadioInp.apply(this, arguments);		
	}
	
	$.extend(BooleanInp.prototype, RadioInp.prototype, { });

	
	function choiceRow(cfg) {
		var div = $("<div class='choice-inp'></div>");
		var chk = $("<input class='inp-choice-chk' type='checkbox'>");
		var txt = $("<input class='inp-choice-txt' type='text'>");
		var a = $("<a class='inp-choice-a' href='javascript:void(0)'>remove</a>");
		div.append(chk, txt, a);
		cfg.cntr.append(div);
		
		a.on("click", function() {
			div.remove();
			cfg.remove();
		});
		
		return {
			setValue: function(val) {
				txt.val(val.txt);
				chk.attr("checked", val.checked);
			},
			
			getValue: function() {
				return {
					txt: txt.val(),
					checked: chk.prop("checked")
				};
			},
			
			isEmpty: function() {
				var v = txt.val();
				return (v === "" || v == null || v == undefined);
			}
		};
	}
	
	function ChoiceInp(args) {
	    return TextInp.apply(this, arguments);
	}
	
	$.extend(ChoiceInp.prototype, TextInp.prototype, {
		_html: function(args) {
			return "<div id='" + this.id + "'></div>";
		},
		
		doAfterRender: function(e, args) {
			var div = $("#" + this.id);
			var addE = $("<a href='javascript:void(0)'>Add</a>");
			var act_div = $("<div class='choice-add'></div>");
			act_div.append(addE);
			$(div.parent()).append(act_div);
			
			var self = this;
			addE.on("click", function() {
				self.addChoice();
			});
			
			this._rows = [];
			if(!args || !args.values) {
				this.addChoice();
				this.addChoice();
				return;
			}
			this._ov = args.values;
			this.setValue(args.values);
		},
		
		addChoice: function() {
			var self = this;
			var i = this._rows.length;
			var row = choiceRow({
				cntr: $("#" + this.id),
				remove: function() {
					self._rows.splice(i, 1);
				}
			});
			this._rows.push(row);
			return row;
		},
		
		getValue: function() {
			var arr = [];
			$.each(this._rows, function(i, row) {
				arr.push(row.getValue());
			});
			return arr;
		},
		
		setValue: function(arr) {
			this.clear();
			var self = this;
			$.each(arr, function(i, val) {
				var row = self.addChoice();
				row.setValue(val);
			});
		},
		
		validate: function() {
			if(this._rows.length < 2) {
				this.setErr("Should Enter atleast two choices");
				return false;
			}
			var isChecked = false;
			var valid = true;
			var self = this;
			$.each(this._rows, function(i, row) {
				if(row.isEmpty()) {
					self.setErr("Choices cannot be empty");
					valid = false;
					return false;
				}
				val = row.getValue();
				if(val.checked) {
					isChecked = true;
				}
			});
			if(!valid) {
				return false;
			}
			if(!isChecked) {
				this.setErr("Please choose an answer");
				return false;
			}
			return true;
		},
		
		isDirty: function() {
			var nv = this.getValue();
			var ov = this._ov;
			if(ov == null || ov.length == 0) {
				if(nv.length > 0) {
					return true;
				}
				return false;
			}
			if(ov.length != nv.length) {
				return true;
			}
			var dirty = false;
			$.each(ov, function(i, o) {
				n = nv[i];
				if(n.checked != o.checked ||o.txt != n.txt) {
					dirty = true;
					return false;
				}
			});
			return dirty;
		},
		
		clear: function(addDef) {
			this._rows = [];
			$("#" + this.id).html("");
			if(addDef) {
				this.addChoice();
				this.addChoice();	
			}
		},
		
		isEmpty: function() {
			var empty = false;
			$.each(this._rows, function(i, row) {
				if(row.isEmpty()) {
					empty = true;
					return false;
				}
			});
			return empty;
		},

		getOldDispText: function() {
			if(!this._ov) {
				return "";
			}
			return this._buildDispText(this._ov);
		},
		
		_buildDispText: function(arr) {
			var text = [];
			$.each(arr, function(i, row) {
				var t = row.txt;
				if(row.checked) {
					t = "<b>" + t + "</b>";
				}
				text.push(t);
			});
			return text.join(",");
		},
		
		getDispText: function() {
			return this._buildDispText(this.getValue());	
		}
	});

	var EMAIL_RX = /(([a-zA-Z0-9\-?\.?]+)@(([a-zA-Z0-9\-_]+\.)+)([a-z]{2,3}))+$/;
	
	var PWD_RX = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
	
	var NAME_RX = /^[a-z ,.-]+$/i;	
	
	var PH_RX = { 
		"10digit": /^\d{10}$/ ,
		"north-american": /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/ ,
		"internatioal": /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/ ,
		"+":	/^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/ 
	};  
	
	function Validator(type, val) {
		switch(type) {
			case "email": 
				if(!EMAIL_RX.test(val)) {
		    		throw "Invalid Email";
		    	}
		    	break;
			case "name": 
				if(!NAME_RX.test(val)) {
		    		throw "Invalid Name";
		    	}
		    	break;
		    case "phone":
		    	//implementation pending
		    	break;
		    case "pwd":
		    	if(!PWD_RX.test(val)) {
		    		throw "Invalid Password";
		    	}
		    	break;
		    case "N":
		    	if(isNaN(val)) {
		    		throw "Should be a Number";
		    	}
		   		break;
		   	case "+N":
		   		if(isNaN(val) || val < 0) {
		   			throw "Should be a Positive Number";
		   		} 
				break;
			case "-N":
		   		if(isNaN(val) || val > 0) {
		   			throw "Should be a Negative Number";
		   		} 
				break;
			default:
				if(type.indexOf("R") == 0) {
					var t = type.substring(1).split("-");
					if(val < t[0] || val > t[1]) {
						throw "Number Should be with in " + t[0] + " to " + t[1];
					}
				} else if(type.indexOf("N") == 0) {
					var d = type.substring(1);
					if(val.length != d) {
						throw "Should have " + d + " digits ";
					}
					if(isNaN(val)) {
						throw "Should be a " + d + " digit Number";
					}
				}
		}
		return true;
	};
	
	function ExprValidator(inp, form) {
		var expr = inp.cfg.validator;
		var v = inp.getTypedValue();

		if(expr.indexOf("<=") == 0 && !(v <= getVal(2))) {
			throw inp.getDisplayName() + " Should be Lesser than or Equal to " + getName(2);
		}
		
		if(expr.indexOf("<") == 0 && !(v < getVal(1))) {
			throw inp.getDisplayName() + " Should be Lesser than " + getName(1);
		}

		if(expr.indexOf(">=") == 0 && !(v >= getVal(2))) {
			throw inp.getDisplayName() + " Should be Greater than or Equal to" + getName(2);
		}
		
		if(expr.indexOf(">") == 0 && !(v > getVal(1))) {
			throw inp.getDisplayName() + " Should be Greater than " + getName(1);
		}

		if(expr.indexOf("=") == 0 && !(v == getVal(1))) {
			throw inp.getDisplayName() + " Should match " + getName(1);
		}

		if(expr.indexOf("!=") == 0 && !(v != getVal(2))) {
			throw inp.getDisplayName() + " Same as " + getName(2);
		}
	
		function getVal(i) {
			return getInp(i).getTypedValue();
		}
		
		function getName(i) {
			return getInp(i).getDisplayName();
		}
		
		function getInp(i) {
			return form.getInp(expr.substring(i));
		}	
	}
	
	return { text: TextInp, textarea: TextAreaInp, file: FileInp, bool: BooleanInp,
			image: ImageInp, select: SelectInp, enum_select: EnumSelectInp,
			bool_select: BoolSelectInp, 
			date: DateInp, radio: RadioInp, enum: EnumInp, choice: ChoiceInp };
		
})();

window.$1 = function(id) {
	return document.getElementById(id);
};

