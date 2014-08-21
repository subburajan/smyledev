
function JQDataTableConfig(url, columns, fmap) {
	return {
		"aoColumns": columns,
        "bJQueryUI": true,
		"bFilter": false,
        "sPaginationType": "full_numbers",
        "sServerMethod": "POST",
        "sAjaxSource": url,
		"bProcessing": true,
        "bServerSide": true,
        "fnServerData": function(sSource, aoData, fnCallback) {
			var filters = filterAOData(aoData, fmap);
			
			$.ajax({
				"dataType": 'json',
				"type": "POST",
				"url": sSource, 
				"data": filters,
				"success": fnCallback
			});	
		}
    };
}

function JQDataTableLocalConfig(data, columns) {
	return {
		"aoColumns": columns,
        "bJQueryUI": true,
        "sPaginationType": "full_numbers",
		"bAutoWidth": true,
        "aaData": data
    };
}

$.fn.dataTableExt.oApi.fnReloadAjax = function(oSettings, sNewSource) {
	if(sNewSource) {
		oSettings.sAjaxSource = sNewSource;
	}
	this.fnDraw(true);
};

$.fn.dataTableExt.oApi.getRowForColIndx = function(oSettings, colInd, value) {
	var rows = this.fnGetData();
	var result = null;
	$.each(rows, function(ind, row) {
		if(row[colInd] == value) {
			result = row;
			return false;
		}
	});
	return result;
};

$.fn.dataTableExt.oApi.updateRowById = function(oSettings, id, fn) {
	var rows = this.fnGetData();
	var self = this;
	$.each(rows, function(ind, row) {
		if(row[0] == id) {
			fn(row);
			self.fnUpdate(row, ind);
			return false;
		}
	});
};

$.fn.dataTableExt.oApi.getColumnIndex = function(oSettings, colName) {
	var cols = oSettings.aoColumns;
	var i = -1;
	$.each(cols, function(ind, val) {
		if(val.sTitle == colName || val.id == colName) {
			i = ind;
			return false;
		}
	});
	return i;
};


function filterAOData(aoData, fmap) {
	var filters = [];
	$.each(aoData, function(i, data) {
		var n = data.name;
		if(n == "iDisplayStart" || n == "iDisplayLength" ||
			n.indexOf("iSortCol") == 0 || n.indexOf("sSortDir") == 0) {
			filters.push(data);
		}
	});
	
	if(fmap) {
		for(var k in fmap) {
			filters.push({ name: k, value: fmap[k]});
		}
	}
	return filters;
}

(function() {
	
window.JQF = {
	
	def_actions: function(arr) {
		return this.actions(arr);
	},
	
	actions: function(actions) {
		return function(data, type, row) {
			var html = "<div class='manage-col'>";
			$.each(actions, function(i, act) {
				var id = row[act.param || 0];
				if(act.type == "href") {
					var url = act.url + id;
					if(act.args) {
						//url += (url.indexOf("?") > -1? "&": "?") + act.args;					
					}
					html += "<a href='" + url + "'>" + act.title + "</a>";
				} else {
					html += "<a href='javascript:void(0)' onclick='jq_act(\"" + act.id + 
						"\",\"" + id + "\", event)'>" + act.title + "</a>";
					jq_act_reg(act);
				}
			});
			html += "</div>";
			return html;
		};
	},
	
	obj: function(f, url) {
		var fn = getFormatter(url);
		return function(data, type, row) {
			return (data && fn(data[f], row[0])) || "-";
		};
	},
	
	obj_arr: function(f, partial, url) {
		var fn = getFormatter(url);
		return function(data, type, row) {
			if(!data || data.length == 0) {
				return "-";
			}
			var arr = [];
			$.each(data, function(ind, d) {
				arr.push(d[f]);
			});
			return arr.length > 0 && fn(trim(arr.join(", ")), row[0]) || "-";
		};
	},
	
	obj_fields: function(fields, sep, url) {
		var fn = getFormatter(url);
		return function(data, type, row) {
			if(!data) {
				return "";
			}
			var sep = sep || " ";
			var arr = [];
			$.each(fields, function(i, f) {
				arr.push(data[f]);
			});
			return fn(arr.join(sep), row[0]);
		};
	},
	
	enum_arr: function(e, url) {
		var E = orderedEnum(e);
		var fn = getFormatter(url);
		return function(data, type, row) {
			if(!data) {
				return "";
			}
			var arr = [];
			$.each(data, function(i, d) {
				arr.push(E[d - 1].text);
			});
			return fn(arr.join(", "), row[0]);
		};
	},
	
	detail: function(url) {
		return function(data, type, row) {
			return "<a href='" + url + "/detail/" + row[0] + "'>" + data + "</a>";
		};		
	},

	obj_detail: function(field, url) {
		return function(data, type, row) {
			if(!data) {
				return "-";
			}
			return "<a href='" + url + "/detail/" + data._id + "'>" + data[field] + "</a>";
		};
	},	
	
	gender: function(url) {
		return this.enum(Enums.Day);
	},
	
	day: function(url) {
		return this.enum(Enums.Day);
	},
	
	enum: function(Enum, url) {
		var fn = getFormatter(url);
		return function formatDetCol(data, type, row) {
			var e = getEnumByValue(Enum, data);
			return (e && fn(e.text, row[0])) || "-";
		};
	},

	obj_enums: function(fields, enums, url) {
		for(var k in enums) {
			enums[k] = Enums[enums[k]];
		}
		var fn = getFormatter(url);
		return function formatDetCol(data, type, row) {
			if(!data) {
				return "-";
			}
			var val = getDVforObjAndEnums(data, fields, enums);
			
			return val && fn(trim(val), row[0]) || "-";
		};
	},
	
	obj_enums_detail: function(fields, enums, url) {
		for(var k in enums) {
			enums[k] = Enums[enums[k]];
		}
		return function formatDetCol(data, type, row) {
			if(!data) {
				return "-";
			}
			var val = getDVforObjAndEnums(data, fields, enums);
			if(!val) {
				return "-";
			}
			val = trim(val);
			return "<a href='" + url + "/detail/" + row[0] + "'>" + val + "</a>";
		};
	},	
	
	arr: function(url) {
		var fn = getFormatter(url);
		return function(data, type, row) {
			if(!data) {
				return "";
			}
			return fn(data.join(","), row[0]);
		};
	},	
	
	image: function(url) {
		var fn = getFormatter(url);
		return function(data, type, row) {
			var url = data && data.id? "/uploader/file/" + data.id: "/common/images/dummy.jpg";
			return fn("<img class='col-image' src='" + url + "'>", row[0]);
		};
	},	
	
	date:  function(url) {
		var fn = getFormatter(url);
		return function(data, type, row) {
			var date = new Date(Date.parse(data));
			return fn(DateFormatter.dateToDateStr(date), row[0]);
		};
	},	
	
	bool:  function(url) {
		var fn = getFormatter(url);
		return function(data, type, row) {
			if(data == null) {
				return "-";
			}
			return fn(data === true? "Yes": "No", row[0]);
		};
	}
};

function trim(str, partial) {
	partial = partial || 50;
	if(str.length < partial) {
		return str;
	}
	return "<span title=\"" + str + "\">" + str.substring(0, partial) + "...</span>";
}

function getDVforObjAndEnums(obj, fields, enums) {
	var arr = [];
	$.each(fields, function(i, f) {
		var v = obj[f];
		if(enums[f]) {
			v = getEnumByValue(enums[f], v).text;
		}
		arr.push(v);
	});
	return arr.join(" ");
}


function getFormatter(url) {
	return url? function(data, id) {
		return "<a href='" + url + "/detail/" + id + "'>" + data + "</a>";
	}: function(data) {
		return data;
	};
}

var JQ_Actions = {};
function jq_act_reg(act) {
	JQ_Actions[act.id] = act.fn;
}

window.jq_act = function(actid, rowid, e) {
	JQ_Actions[actid](rowid, e);
};

})();
