var bg;
function openOverlay(id, onid, cb) {
	if(bg) {
		bg.remove();
	}
	bg = $("<div class='overlay-bg'></div>");
	var cnt = $("#" + id);
	var p = cnt.parent();
	$(p).append(bg);
	bg.css("display", "block");
	cnt.css("display", "block");
	if(cb) {
		cb();
	}
	
	
	
}

function closeOverlay(id) {
	if(bg) {
		bg.css("display", "none");
	}
	var cnt = $("#" + id);
	cnt.css("display", "none");
}
