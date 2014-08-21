
var Search = (function() {
	
	function Search(cfg) {
		this.cfg = cfg;
		this.inps = [];
		this.init();
		return this;
	}
	
	Search.prototype = {
		init: function() {
			if(this.cfg.fields.length == 0) {
				return;
			}
			
			var self = this;
			var pf = this.cfg.jq.filter;
			if(pf) {
				var arr = [];
				for(var k in pf) {
					arr.push({ name: k, value: encodeURIComponent( pf[k] ) });
				}
			}
			this.cfg.table.fnSettings().fnServerData = function(sSource, aoData, fnCallback) {
				var filters = self.getFilters(arr);
				filters = filters.concat(filterAOData(aoData));
				
				$.ajax( {
					"dataType": 'json', 
					"type": "POST", 
					"url": sSource, 
					"data": filters, 
					"success": fnCallback
				});	
			};
		},
		
		render: function(cntrid) {
			if(this.cfg.fields.length == 0) {
				return $("#" + cntrid).remove();
			}
			var div = $("<div class='search-fields' id='" + cntrid + "_fields'></div>");
			var butt = $("<div class='search-butt butt butt-def'><a href='javascript:void(0)'>Search</a></div>");
			
			$("#" + cntrid).append(div, butt, "<div class='clear'></div>");
			cntrid += "_fields";
			
			var self = this;
			butt.on("click", function() {
				self.search();
			});
			
			var inps = this.inps;
			$.each(this.cfg.fields, function(ind, cfg) {
				var clazz = INPUT_TYPES[cfg.itype];
				var inp = new clazz(cfg);
				inp.render({ container: cntrid });
				inps.push(inp);
				cfg.inp = inp;
			});
		},
		
		validate: function() {
			var valid = true;
			$.each(this.inps, function(ind, i) {
				if(!i.validate()) {
					valid = false;
					return false;
				}
			});
			return valid;			
		},
		
		search: function() {
			if(!this.validate()) {
				return;
			}
			this.cfg.table.fnReloadAjax();
		},
		
		getFilters: function(pre) {
			var args = [].concat(pre);
			$.each(this.inps, function(ind, i) {
				if(!i.isEmpty()) {
					args.push({ name: i.cfg.id, value: encodeURIComponent(i.getValue()) });
				}
			});
			return args;	
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
		
		clear: function() {
			$.each(this.inps, function(ind, i) {
				i.clear();
			});
		}
	};
	
	return Search;
	
})();
