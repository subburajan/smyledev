

function CTX(cfg) {
	this.id = cfg.box;
	return this;
}


CTX.prototype = {
	
	open: function() {
		$(this.id).css("display", "block");
		var inside = false;
		$(this.id).mouseenter(function() {
			inside = true;
		});
	
		$(this.id).mouseleave(function() {
			inside = false;
		});
	
		var self = this;
		$(document.body).bind("click.c1", function() {
			if(!inside) {
				self.close();
			}
		});
	},
	
	close: function() {
		$(this.id).css("display", "none");
		$(document.body).unbind("click.c1");
	}
		
};

