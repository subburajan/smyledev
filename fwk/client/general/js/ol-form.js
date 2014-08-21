
function _OLForm(Args, id_prfx, table) {

	var per = Args.per;
	if(per.c) {
		var addnew = id_prfx + "butt_addnew";
	    var e = $("#" + addnew);
	    e.css("visibility", "visible");
	    e.on("click", addAction);		
	}
    
    var form;

    if($1(id_prfx + "ol")) {
    	$("#" + id_prfx + "butt_save").on("click", saveAction);
    	$("#" + id_prfx + "butt_cancel").on("click", cancelAction);
    }

	function addAction() {
		if(!$1(id_prfx + "ol")) {
			drawFormOL();
		}
        openOverlay(id_prfx + "ol", "page_content", function() {
			form = createForm("Add New " + Args.title);	
		});
	}
	
	function saveAction() {
		var cb = Args.manage.afterSave;
        form.save(function(map, resp, id) {
            cb? cb(map, resp, id): table.fnReloadAjax();
            closeOverlay(id_prfx + "ol");
        });
	}
	
	function cancelAction() {
    	form && form.destroy();
    	form = null;
        closeOverlay(id_prfx + "ol");
	}
	
	function drawFormOL() {
		var page = $("#page_content");
		page.append(
		'<div class="content-manage overlay shadow" id="' + id_prfx + 'ol" style="display:none">\
			<div class="manage" id="' + id_prfx + 'cntr">\
				<div class="manage-hdr">\
					<div class="manage-title" id="' + id_prfx + 'title"></div>\
				</div>\
				<div class="manage-cnt" id="' + id_prfx + 'cnt">\
				</div>\
				<div class="manage-err hide" id="' + id_prfx + 'err">\
				</div>\
				<div class="butt-cntr manage-butt">\
					<span class="butt butt-def" id="' + id_prfx + 
						'butt_save" ><a href="javascript:void(0)">Save </a></span>\
					<span class="butt butt-def" id="' + id_prfx + 
						'butt_cancel" ><a href="javascript:void(0)">Cancel</a></span>\
				</div>\
			</div>\
		</div>');

    	$("#" + id_prfx + "butt_save").on("click", saveAction);
    	$("#" + id_prfx + "butt_cancel").on("click", cancelAction);
	}
		
	function edit(id, args, cfg) {
		if(!$1(id_prfx + "ol")) {
			drawFormOL();
		}		

		openOverlay(id_prfx + "ol", "page_content", function() {
			showForm(id, args, cfg);
		});
	};
	
	function showForm(id, args, cfg) {
		setButtsVisible(true);
		var title = cfg.title || ("Edit " + Args.title);
		form = createForm(title, id, cfg);
		var bp = Args.manage.beforePopulate;
		bp && bp(args);
		form.populate(args);
	}

	function openEditor(title, cb) {
		if(!$1(id_prfx + "ol")) {
			drawFormOL();
		}
		
		openOverlay(id_prfx + "ol", "page_content", function() {
			setButtsVisible(false);
	
			$("#" + id_prfx + "title").html(title);
			cb({
				err: function(err) {
					setButtVisible("cancel", true);
					return setErr(err, title);
				},
				showForm: showForm
			});
		});
	}
	
	function setButtsVisible(visible) {
		var fn = visible? "removeClass": "addClass";
		 $("#" + id_prfx + "butt_save")[fn]("hide");
		 $("#" + id_prfx + "butt_cancel")[fn]("hide");
	}
	
	function setButtVisible(type, visible) {
		var fn = visible? "removeClass": "addClass";
		$("#" + id_prfx + "butt_" + type)[fn]("hide");		
	}
	
	function setErr(err) {
		var e = $("#" + id_prfx + "err");
		e.removeClass("hide");
		e.html(err);
	}
	
	function createForm(title, id, editcfg) {
		var fields;
		var url = Args.URI;
		var manage = Args.manage;
		
		if(!id) {
			fields = [];
			$.each(manage.fields, function(i, f) {
				if(f.immutable) {
					f = $.extend({}, f);
					delete f.immutable;
				}
				fields.push(f);
			});
		} else {
			fields = editcfg.fields || manage.fields;
			url = editcfg.URI || (url += "/" + id);
		}
		
		var cfg = {
			cntrid: id_prfx + "cntr",
			name: title,
			postURL: url,
			fields: fields,
			id: id || "addnew",
			id_prfx: id_prfx,
			pid: Args.parent_id,
			fixed: false,
			beforeSave: function(data, cb) {
				var bs = manage.beforeSave;
				bs? bs(data, cb, id): cb(data);
			},
			isNew: !id && true
		};
		
		manage.beforeEdOpens && manage.beforeEdOpens(cfg);

		form = new GeneralForm(cfg, {
			add: function(data) {
				//
			}
		});
		form.listenChainEvents();
		
		return form;
	}
	
	return {
		add: addAction,
		edit: edit,
		openEditor: openEditor,
		
		getForm: function() {
			return form;
		}
	};
	
}