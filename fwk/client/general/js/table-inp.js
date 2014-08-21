
(function() {
	
	$(document).ready(function() {
		
		if(INPUT_TYPES == undefined) {
			return;	
		}
		
		var TextInp = INPUT_TYPES.text;
		
		function TableInp() {
			TextInp.apply(this, arguments);
		}
		
		$.extend(TableInp.prototype, TextInp.prototype, {
			_html: function() {
				var args = this.cfg.args;
				var cols = args.cols;
				var html = ["<table id='" + this.id + "' class='table-inp'><tr class='head'>"];
				var row = ["<tr>"];
				$.each(cols, function(i, col) {
					html.push("<th>" + col + "</th>");
					row.push("<td><input class='tb-txt-field'></td>");
				});
				row.push("</tr>");
				html.push("</tr>");
				
				var count = args.count;
				row = row.join("");
				for(var i = 0; i < count; i++) {
					html.push(row);
				}
				html.push("</table>");
				
				return html.join("");
			},
			
			doAfterRender: function(e, args) {
				var ids = this.cfg.args.ids;
				var l = ids.length;
				var map = {};
				for(var j = 0; j < l; j++) {
					map[ids[j]] = j;
				}
				this._idIndxMap = map;
				this.cfg.default && this.setValue(this.cfg.default);
			},
			
			getInps: function() {
				return $("#" + this.id).find("input");
			},
			
			isDirty: function() {
				var ov = this._oldValue;
				var nv = this.getValue();
				if(!ov || nv.length == 0) {
					return false;
				}
				if(ov.length != nv.length) {
					return true;
				}
				var l = ov.length;
				var ids = this.cfg.args.ids;
				var m = ids.length;
				for(var i = 0; i < l; i++) {
					var v1 = ov[i], v2 = nv[i];
					for(var j = 0; j < m; j++) {
						var k = ids[j];
						if(v1[k] != v2[k]) {
							return true;
						}
					}
				}
				return false;
			},
			
			getValue: function() {
				var arr = this.getInps();
				var ids = this.cfg.args.ids;
				var l = ids.length;
				var out = [];
				var count = arr.length / l, k = 0;
				for(var i = 0; i < count; i++) {
					var obj = {};
					for(var j = 0; j < l; j++) {
						var v = arr[ k++ ].value;
						if(v && v.trim().length > 0) {
							obj[ids[j]] = v.trim();
						}
					}
					out.push(obj);
				}
				return out;
			},
			
			setValue: function(values) {
				var arr = this.getInps();
				var map = this._idIndxMap;
				var l = this.cfg.args.ids.length;
				$.each(values, function(i, obj) {
					for(var k in obj) {
						var m = i * l + map[k];
						arr[m].value = obj[k];
					}
				});
			},
			
			isEmpty: function() {
				var arr = this.getValue();
				return arr.length == 0;
			},
			
			rollback: function() {

			},
			
			resetOldValue: function() {

			},
			
			getOldDispText: function() {

			},
			
			getDispText: function() {

			},
			
			_dispText: function(val) {

			},
							
			_validate: function() {
				return true;
			}
		});
		
		INPUT_TYPES.table = TableInp;
		
	});
	
})();

