
var Tree = (function() {
	
	function Tree(cfg) {
		this.cfg = cfg;
		return this;
	}
	
	
	Tree.prototype = {
		load: function(data) {
			this.reload(data);
		},
		
		reload: function(data) {
			$(this.cfg.render).html("");
			loadTree(this.cfg.render, data);
			this._on("file", this.cfg.onFile);
			this._on("folder", this.cfg.onFolder);
		},
		
		_on: function(path, cb) {
			if(!cb) return;
			var self = this;
			$(this.cfg.render + " ." + path).on("click", function(e) {
				e = $(e.target);
				cb({ id: e.attr("_key"), name: e.text(), level: e.attr("_lvl") });
			});		
		}
	};
	
	/**
	 * 
	 * @param Array  data
	 */
	function loadTree(render, data) {
		var html = "<ul>";
		function build(node, lvl) {
			var cz = node.childs ? "folder": "file";
			if(node.cz) { 
				cz += " " + node.cz;
			}
			html+= "<span class='" + cz + "' _key='" + node.id +
				"' _lvl='" + lvl + "'>" + node.name + "</span>";
			
			if(!node.childs) {
				return;
			}
			
			html += "<ul>";
			$.each(node.childs, function(ind, node) {
				html += "<li>";
				build(node, lvl + 1);
				html += "</li>";
			});
			html += "</ul>";
		}
		build(data, 0);
		html += "</ul>";
		
		$(render).append(html);
		
		$(render).treeview();
	}
	
	return Tree;
})();

