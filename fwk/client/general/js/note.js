
var Note = (function() {

	function Note(objId) {
		this.objId = objId;
		return this;
	}
	
	Note.prototype = {
		render: function(cntrId) {
			var man_div = $("<div class='note-manage'></div>");
			var msg = $("<textarea class='note-msg' id='msgbox'></textarea>");
			var butts = $("<div class='note-butts'></div>");
			var butt = $("<span class='butt butt-def'><a href='javascript:void(0)'>Add Comments</a></span>");
			
			man_div.append(msg, butts);
			butts.append(butt);
			
			var list_div = $("<div class='note-list'></div>");
			
			$("#" + cntrId).append(man_div, list_div);
			
			var self = this;
			butt.on("click", function() {
				self.createNote(msg.val(), function() {
					msg.val("");
				});
			});
			
			this._list_div = list_div;
			this.reload();
		},
		
		createNote: function(msg, cb) {
			if(msg == undefined || msg.trim().length == 0) {
				return;
			}
			msg = msg.trim();
			var data = "data=" + msg;
			var self = this;
			$.ajax({
				url: "/note/" + this.objId,
				type: "POST",
				data: data,
				success: function(response) {
					response = $.parseJSON(response);
					if(response.status == "OK") {
						var note = response.message;
						note.msg = msg;
						self.addNote(note, true);
						cb && cb();
					}
				}
			});
		},
		
		reload: function() {
			this._list_div.html("");
			var self = this;
			$.ajax({
				url: "/note/" + this.objId,
				type: "GET",
				success: function(response) {
					response = $.parseJSON(response);
					if(response.status == "OK") {
						var list = response.message;
						$.each(list, function(i, note) {
							self.addNote(note);
						});
					}
				}
			});
		},
		
		addNote: function(note, prepend) {
			var created = DateFormatter.dateToStr(DateFormatter.utcStrToDate(note.created));
			var name = note.crBy && note.crBy.name || "Unknown";
			var html = "<div class='note-row' id='" + note._id + "'>\
				<div class='note-row-info'>\
					Comment by <span class='note-user'>" + name + "</span>,\
					 on <span class='note-created'>" + created + "</span>\
				</div>\
				<div class='note-row-msg'>" + note.msg + "</div>\
				<div class='clear'></div>\
				</div>";
			var div = this._list_div;
			prepend? div.prepend(html): div.append(html);
		},
		
		addChangeNote: function(form, data) {
			var msg = ["<table class='note-tbl'><tr><th>Field Name</th><th>Old value</th><th>New Value</th></tr>"];
			$.each(form.cfg.fields, function(i, field) {
				if(data[field.id]) {
					var i = field.inp;
					msg.push("<tr><td>" + field.name + "</td><td>" + 
						i.getOldDispText() + "</td><td>" + i.getDispText() + "</td></tr>");	
				}
			});
			msg = "Following fields are changed <br>" + msg.join("") + "</table>";
			this.createNote(msg);
		}
		
	};
	
	return Note;
	
})();

