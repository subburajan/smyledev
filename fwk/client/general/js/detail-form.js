
var DetailForm = (function() {

	var form, note, Args;
	var id_prx, per;
	
	function initForm() {
		var obj = Args.obj, uri;
		if(obj) {
			$("#cr").html(DateFormatter.getDisplayText(obj.created, "date"));	
			uri = "/" + obj._id;	
		} else {
			uri = "";
			$($("#cr").parent()).css("display", "none");
		}
		
		var cfg = {
			postURL: Args.URI + uri,
			dv_enabled: true,
			fields: [],
			id_prfx: id_prfx,
			id: "app",
			name: Args.title || "",
			fixed: true,
			beforeSave: Args.beforeSave || function(data, cb) {
				cb(data);
			}
		};
		

	  	var p = Args.per || _per;
	  	if(p && (p.w || p.c)) {
	  		cfg.per = per = p;
	  	}

		form = new GeneralForm(cfg);
		form.addFieldSets(Args.sets);
		
		obj && form.populate(obj);
		
		form.listenChainEvents();
		
		initLinks();
	}
	
	function initLinks() {
		var links = Args.links;
		if(!links || links.length == 0) {
			return;
		}
		var html = [];
		$.each(links, function(i, link) {
			if(link.roles && $.inArray(_Role, link.roles) == -1) {
				return;
			}
			var cz = "";
			var hasParams = link.params && link.params.length > 0;
			if(link.type != "href") {
				cz = "class='_post'";
				if(hasParams) {
					cz += " data-i=" + i;
				}
			} else if(hasParams) {
				cz = "class='_get' data-i=" + i;
			}
			html.push("<a href='" + link.url + "' " + cz + ">" + link.title + "</a>");
		});
		if(html.length == 0) {
			return;
		}
		$("#hdr_links").append(html.join(""));
		
		$("#hdr_links ._post").on("click", function(e) {
			var url = createUrl(e);
			e.preventDefault();
			$.ajax({
				type: "POST",
				url: url,
				success: function(r) {
					r = $.parseJSON(r);
					if(r.status == "OK") {
						form.setMsg(false, r.message);					
						Args.success && Args.success(url, {}, r.message);
					} else {
						form.setMsg(true, r.reason.err);
					}
				},
				error: function(err) {
					form.setMsg(true, "Server Unreachable");
				}
			});
		});
		
		$("#hdr_links ._get").on("click", function(e) {
			e.preventDefault();
			window.location = createUrl(e);
		});
	}
	
	function createUrl(e) {
		var target = $(e.target);
		var url = target.attr("href");

		var i = target.attr("data-i");
		var link = Args.links[i];
		if(!link) {
			return url;
		}
	
		var args = [];
		$.each(link.params, function(i, param) {
			var inp = form.getInp(param);
			if(inp) {
				var val = inp.getValue();
				if(val) {
					args.push(param + "=" + encodeURIComponent(val));				
				}
			}
		});

		if(args.length > 0) {
			url += (url.indexOf("?") > -1? "&": "?") + args.join("&");
		}
		return url;
	}

	function hide(id) {
		$("#" + id_prfx + id).css("display", "none");
	}
	
	function showi(id) {
		$("#" + id_prfx + id).css("display", "inline");
	}
	
	function initActions() {
	  	if(!_per || !_per.w || Args.immutable) {
	  		return;
	  	}

		showi("butt_edit");
		
		$("#" + id_prfx + "butt_edit").on("click", function() {
			form.setEditable(true);
			hide("butt_edit");
			showi("butt_save");
			showi("butt_cancel");
		});
		
		$("#" + id_prfx + "butt_cancel").on("click", function() {
			cancelForm();
		});
		
		$("#" + id_prfx + "butt_save").on("click", function() {
			form.save(function(data, message) {
				note.addChangeNote(form, data);
				form.setEditable(false);
				form.resetOldValues();
				showi("butt_edit");
				hide("butt_save");
				hide("butt_cancel");
				Args.success && Args.success(null, data, message);
			});
		});		
	}
	
	function cancelForm() {	
		form.setEditable(false);
		showi("butt_edit");
		hide("butt_save");
		hide("butt_cancel");
		form.rollback();
	}

	return {
		init: function(args) {
			Args = args;
			id_prfx = Args.id_prfx || "form_";
			initForm();
					
			form.setEditable(false);
			
			initActions();
			
			if(per && per.w) {
				note = new Note(Args.obj._id);
				note.render("notes");				
			}
			return this;
		},
		
		getArgs: function() {
			return Args;
		},
		
		getForm: function() {
			return form;
		},
		
		cancelForm: cancelForm,
		
		setMsg: function(isErr, msg, noautohide) {
			form.setMsg(isErr, msg, noautohide);
		}
	};

})();

