
function _TableForm(Args) {
	
	var form, table;
	var id_prfx;
	
	function init() {
		id_prfx = (Args.manage && Args.manage.id_prfx) || "form_";
		
		initButts();
		initTable();
		if(!Args.nosearch) {
			initSearch();
		}
		
		if(!Args.nomanage) {
			initFormActions();
		}
	}
	
	function initButts() {
		if(!Args.butts) {
			return;
		}
		var cntr = $("#" + id_prfx + "hdr_butts");
		$.each(Args.butts, function(i, butt) {
			addButt(butt);
		});
		
		function addButt(butt) {
			var e = $('<span class="butt butt-def"><a href="javascript:void(0)">' + butt.title + '</a></span>');
			cntr.append(e);
			e.on("click", function() {
				if(butt.url) {
					return callUrl(butt.url);
				}
				if(butt.fn) {
					return butt.fn();
				}
			});
		}
	}
	
	function _setMsg(isErr, msg) {
        var je = $("#" + id_prfx + "hdr_msg");
		setMsg(je, isErr, msg);
	}		
	
    function initTable() {
    	var jq = Args.jq;
    	var cols = [{ "sTitle": "Id", "bVisible": false }].concat(jq.cols);

    	var tid = Args.jq.tableid || "table";

		if(!jq.nolinks) {
	        var actFmtFn = jq.formatActions || getRowActions();    //	var actFmtFn = Args.jq.formatActions || JQF.def_actions(arr);
			if(actFmtFn) {
				var last = { "sTitle": "&nbsp;", "mRender": actFmtFn, "mData": null }; 
		        if(cols.length > 5) {
		        	last.sWidth = "100px";
		        } else if(cols.length < 4) {
		        	last.sWidth = "400px";
		        } else if(cols.length < 5) {
		        	last.sWidth = "200px";
		        }
		    	cols = cols.concat([ last ]);
			}			
		}
 
 		var jq_arg;
 		if(jq.data) {
 	 		jq_arg = JQDataTableLocalConfig(jq.data, cols);		
 		} else {
 		 	jq_arg = JQDataTableConfig(jq.url || ("/jqtable" + Args.URI), cols, jq.filter );	
 		}
    	
    	if(jq.type == Enums.PageTypes.LIST.value) {
    		table = ListTable(tid, jq_arg, jq);
    	} else {
    	    table = $('#' + tid).dataTable(jq_arg);	
    	}
    		
    	function getRowActions() {
    		var links = jq.links;
    		if(links) {
    			var _links = [];
    			$.each(links, function(i, link) {
   					if(!link.roles || $.inArray(_Role, link.roles) > -1) {
   						_links.push(link);
	    				if(link.type != "href" || (link.params && link.params.length > 0)) {
		    				link.id = tid + "_" + i;
		    				link._type = link.type;
		    				link.type = null;
		    				link.fn = getLinkFn(link);
			    		}
   					}
    			});
    			links = _links;
    		} else {
    			links = [];
    		}
    		jq.links = links;
    		
    		if(_per) {
    			var l = links.length + 1;
    			var actions = jq.actions || (jq.actions = []);
    			if(_per.w) {
    				if(actions.indexOf("edit") == -1) {
    					actions.push("edit");
    				}
    				links.push({ id: tid + "_" + l, title: "Edit", fn: editRow });
    			}
    			if(_per.c) {
    				if(actions.indexOf("delete") == -1) {
    					actions.push("delete");
    				}
    				links.push({ id: tid + "_" + (l + 1), title: "Delete", fn: deleteRow });
    			}
    		}

    		return links && JQF.def_actions(links);
    	}
    }

	function getLinkFn(link) {
		return function(rowid, e) {
			var url = link.url, args = createQueryString(link.params, rowid);
			if(url.indexOf("?") == -1) {
				url += "/" + rowid;
				if(args) {
					url += "?" + args;
				}
			} else {
				url += rowid;
				if(args) {
					url += "&" + args;
				}
			}
			
			if(link._type == "href") {
				window.location = url;
			} else {
				callUrl(url);			
			}
		};
	}
	
	function createQueryString(params, rowid) {
		if(!params || params.length == 0) {
			return;
		}
		var data = table.getRowForColIndx(0, rowid);
		var args = [];
		$.each(params, function(i, param) {
			var ind = table.getColumnIndex(param);
			var val = data[ind];
			if(val) {
				val = JSON.stringify(val);
				args.push(param + "=" + encodeURIComponent(val));			
			}
		});
		if(args.length > 0) {
			return args.join("&");		
		}
	}
    
 	function callUrl(url) {
		$.ajax({
			type: "POST",
			url: url,
			success: function(r) {
				r = $.parseJSON(r);
				if(r.status == "OK") {
					_setMsg(false, r.message);
				} else {
					_setMsg(true, r.reason.err);
				}
			},
			error: function(err) {
				_setMsg(true, "Server Unreachable");
			}
		});
	}
    
    function editRow(id) {
		var data = table.getRowForColIndx(0, id);
		var manage = Args.manage, fields;
		if(manage.editFields) {
			fields = manage.editFields(id, data);
		} else {
			fields = manage.fields;
		}
		var args = { }, ua_fields = [];
		$.each(fields, function(i, f) {
			if(f.dataInd < 0) {
				ua_fields.push(f.id);
			} else {
				args[f.id] = data[f.dataInd];
			}
		});
		
		var title = manage.editTitle && manage.editTitle(id, data);
		var uri = manage.editURI && manage.editURI(id, data);
		var cfg = { title: title, fields: fields, URI: uri };
		
		if(ua_fields.length == 0) {
			return form.edit(id, args, cfg);	
		}
		
		form.openEditor("Fatching existing information...", function(ed) {
			fetchUAData(id, ua_fields, function(err, data) {
				if(err) {
					return ed.err("Failed to fetch few information, try again");
				}
				$.each(ua_fields, function(i, ua) {
					args[ua] = data[ua];
				});
				ed.showForm(id, args, cfg);
			});
		});
    }
    
    function fetchUAData(id, ua_fields, cb) {
    	var uri = Args.URI + "/attr/" + id + "?f=" + ua_fields.join(",");
    	$.ajax({
    		type: "GET",
    		url: uri,
    		success: function(r) {
				r = $.parseJSON(r);
				if(r.status == "OK") {
					cb(false, r.message);
				} else {
					cb(true);
				}
    		}
    	});
    }
    
	function deleteRow(id) {
		$.ajax({
			type: "POST",
			url: Args.URI + "/remove/" + id,
			success: function(r) {
				r = $.parseJSON(r);
				if(r.status == "OK") {
					_setMsg(false, r.message);
					table.fnReloadAjax();
				} else {
					_setMsg(true, r.reason.err);
				}
			}
		});
	}; 
    
    function initSearch() {
    	var _id = id_prfx + "search_bar";
    	if(!$1(_id)) {
    		return;
    	}
	    var search = new Search({
	    	table: table,
	    	fields: Args.search.fields,
	    	jq: Args.jq
	    });
	    search.render(_id);
	}

	function initFormActions(title) {
	  	if(!Args.manage || (Args.manage.fields && Args.manage.fields.length == 0)) {
	  		return;
	  	}
	  		  	
	  	var per = Args.per || _per;
	  	if(!per || (!per.w && !per.c)) {
	  		return;
	  	}
	  	Args.per = per;
	  	
		form = _OLForm(Args, id_prfx, table);
	}
	
	init();
	
	return {
		getTable: function() {
			return table;
		},
		
		getForm: function() {
			return form.getForm();
		},
		
		setMsg: _setMsg,
		
		getJSON: function(url, cb) {
			$.ajax({
				type: "GET",
				url: url,
				success: function(r) {
					r = $.parseJSON(r);
					if(r.status == "OK") {
						return cb(false, r.message);		
					}
					cb(r.reason);
				}
			});
		},

		getArgs: function() {
			return Args;
		}
	};
}

var TableForm = {
	init: function(args, parent) {	
		var jq = args.jq;
		if(!parent || isMapEmpty(parent)) {
			if(jq.type == 3) {
				delete args.manage;
			}
			return _TableForm(args);		
		}
		
		var param = parent.param;
		if(parent.obj) {
			var obj = parent.obj;
			var pobjid = obj._id;
		
			var ref = parent._ref;
			var purl = "/" + ref.ref + "/detail/" + pobjid;
			var title = [];

			$.each(ref.sel, function(i, f) {
				var v = obj[f];
				v && title.push(v);
			});
							
			$("#chdr_title").html("<a href='" + purl + "'>" + title.join(" ") + "</a>");
			
			var jqurl = "/jqtable" + args.URI;
			jqurl += ((jqurl.indexOf("?") > -1)? "&": "?");
			jq.url = jqurl + param + "=" + encodeURIComponent(pobjid);			
		}
		
		var jq_rind = reject(jq.cols);
		args.search && reject(args.search.fields);
		
		var man = args.manage;
		if(man) {
			reject(man.fields);
			$.each(man.fields, function(i, a) {
				if(a.dataInd > jq_rind) {
					a.dataInd--;
				}
			});
			man.beforeSave = function(data, cb) {
				data[param] = pobjid;
				cb(data);
			};
		}

		function reject(arr) {
			var ind = -1;
			$.each(arr, function(i, a) {
				if(a.id == param) {
					arr.splice(i, 1);
					ind = i;
					return false;
				}
			});
			return ind;
		}
		
		return _TableForm(args);
	}
};
