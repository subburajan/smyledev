
function List(cfg) {
	this.cfg = cfg;
	return this;
}

List.prototype = {
	load: function() {
		$(this.cfg.renderId).html("");
		if(!this.cfg.getURL) {
			return;
		}
		var self = this;
        $.ajax({
            type: "GET",
            url: this.cfg.getURL,
            success: function(response) {
                response = JSON.parse(response);
                if(response.status == "OK") {
					self.doAfterLoad(response.message);
				}
            }
        });
	},

	doAfterLoad: function(list) {
		var self = this;
		$.each(list, function(ind, data) {
			self.add(data);
		});
	},

	add: function(data) {
		if(typeof(data) == "object") {
			data = JSON.stringify(data);
		}
		$(this.cfg.renderId).prepend("<div id='" + data._id + 
				"' class='list-cnt'>" + data + "</div>");
	},

	remove: function(id) {
		$("#" + id).remove();
	}

};
