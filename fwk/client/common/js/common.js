

function attachClkEvnt(id, fn) {
	var e = $("#" + id);
	var e1;
	e.on("click", function(evt) {
		e1 && e1.html("");
		fn(evt, function(progressMsg) {
			e.css("display", "none");
			if(e1) {
				e1.html(progressMsg || "In Progress");
			} else {
				e1 = $("<span class='progress-msg'>" + (progressMsg || "In Progress") + "</span>");
				e.after(e1);
			}
		}, function(showButt, doneMsg) {
			if(showButt) {
				e.css("display", "inline");
			}
			e1.html(doneMsg || "");
		});		
	});
}

	
function email_link(email, subject, msg) {
	return "mailto:" + email + "?subject=" + subject +"&body=" + msg;
}	

function openEmail(email, subject, msg) {
	window.open(email_link(email, subject, msg));
}

$(document).ready(function() {
	if($("#menu_bar").length == 0) {
		return;
	}
	var prevSM;
	$("#menu_bar >li").on("click", function(e) {
		if(e.target.tagName.toUpperCase() != "A") {
			return;
		}
		var elems = $(e.target.parentNode).find(".sub-menu");
		if(elems.length == 0) {
			return;
		}
		
		prevSM && $(prevSM).css("display", "none");
		var sm = elems[0];
		$(sm).css("display", "block");
		prevSM = sm;
		
		$(document).on("click", function() {
			$(sm).css("display", "none");
			$(this).off("click");
		});
		
		e.stopPropagation();
	});
});


function getEnumByValue(e, val) {
	for(var k in e) {
		if(e[k].value == val) {
			return e[k];
		}
	}
	return null;
}

function orderedEnum(e) {
	var arr = [];
	for(var k in e) {
		var v = e[k];
		arr[v.value - 1] = v;
	}
	return arr;		
}

var timer;
function setMsg(je, isErr, msg, noautohide) {
   	je = je || $("#hdr_msg");
    if(msg.length > 0) {
    	je.html(msg);
        je.removeClass("hide");
        if(!noautohide) {
        	clearTimeout(timer);
	        timer = setTimeout(function() {
				je.animate({ height: "0px" }, 'fast', function() {
					je.addClass("hide");
				});
	        }, 3000);
			je.animate({ height: "20px" }, 'fast');
        }
    } else if(je.length > 0) {
        je.addClass("hide");
    }
    isErr? je.addClass("err"): je.removeClass("err");
}

var getOpts = (function() {
	var Resp = {}, _prog = {};

	function getOpts(url, params, cb) {
		if(url.indexOf("/opts") == -1) {
			url += "_opts";
		}
		if(params) {
			url += "?" + params;
		}
		
		var data = Resp[url];
		if(data) {
			return cb(data);
		}
		
		var p = _prog[url];
		if(p) {
			return p.push(cb);
		}
		_prog[url] = [ cb ];
		
		$.ajax({
			type: "GET",
			url: url,
			success: function(r) {
				r = $.parseJSON(r);
				var data = (r.status == "OK")? r.message: [];
				call_cbs(Resp[url] = data);
			}
		});
		
		function call_cbs(data) {
			var arr = _prog[url];
			$.each(arr, function(i, cb) {
				cb(data);
			});
		}
	}
	
	return getOpts;	
	
})();

function parallel(arr, cb) {
	var count = arr.length;
	var errs, resps;
	
	function done(err, resp) {
		count--;
		if(err) {
			errs? errs.push(err): (errs = [ err ]);
		} else {
			resps? resps.push(resp): (resps = [ resp ]);
		}
		if(count == 0) {
			cb(errs, resps);
		}
	}
	
	$.each(arr, function(i, fn) {
		fn(done);
	});
}

function isMapEmpty(map) {
	if(!map) {
		return true;
	}
	for(var k in map) {
		return false;
	}
	return true;
}


var CREATOR = 0, READ_ONLY = 1, HIDDEN = 2, JQ_FIELDS = 3;

