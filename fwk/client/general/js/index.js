
var mgr = null;
var list;

function onready() {

	list = new List(CFG.listView);
	list.load();

	$("#an_butt").on("click", function() {
		mgr && mgr.cancel();
		var cfg = $.extend(true, {}, CFG);
		mgr = new GeneralInputsMgr(cfg, list);
	});

	$("#an_save").on("click", function() {
		mgr && mgr.save();
	});

	$("#an_cancel").on("click", function() {
		mgr.cancel();
		mgr = null;
	});

};

