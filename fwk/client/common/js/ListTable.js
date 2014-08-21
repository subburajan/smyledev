
function ListTable(id, cfg, jq) {

	var progress = false;
	function load(start, length) {
		if(progress) {
			return;
		}
		progress = true;
		var arg = [
			{ name: "iDisplayStart", value: start },
			{ name: "iDisplayLength", value: length }
		];
		cfg.fnServerData(cfg.sAjaxSource, arg, function(result) {
			render(result.aaData);
			resetPaging(result.iTotalRecords, start, result.aaData.length);
			progress = false;
		});
	}
	
	var currRows;
	function render(arr) {
		currRows = arr;
		var html = [];
		var renderer = jq.renderer || renderEach;
		$.each(arr, function(i, obj) {
			html.push("<table class='lt-box'>" + renderer(obj) + "</table>");
		});
		$("#" + id).html(html.join("") + "<div class='clear'></div>");
	}
	
	var hdrs = "<div class='lt-hdr'>\
			<span class='lt-hdr-txt1'>Show</span>\
			<select id='" + id + "_sel' class='lt-hdr-sel'>\
				<option value='10' selected>10</option>\
				<option value='25'>25</option>\
				<option value='50'>50</option>\
				<option value='100'>100</option>\
			</select><span class='lt-hdr-txt2'>entries</span>\
			<span class='lt-hdr-pag-msg' id='" + id + "_pag_msg'></span>\
			<div class='lt-hdr-pag' id='" + id + "_pag'></div>\
		</div><div id='" + id + "'></div>";
	
	$($("#" + id).parent()).html(hdrs);
	
	$("#" + id + "_sel").on("change", function(e) {
		selCount = parseInt($(e.target).val());
		load(0, selCount);
	});
	
	$("#" + id + "_pag").on("click", function(e) {
		var e = $(e.target);
		if(e.hasClass("enabled")) {
			var val = e.html();
			switch(val) {
				case "First":
					load(0, selCount);
					break;
				case "Previous":
					load(Start - selCount, selCount);
					break;
				case "Next":
					load(Start + selCount, selCount);
					break;
				case "Last":
					load((Math.ceil(Total / selCount) - 1) * selCount, selCount);
					break;
				default:
					load((val - 1) * selCount,  selCount);
			}
		}
	});
	
	function renderEach(obj) {
		var html1 = [];
		var cols = cfg.aoColumns;
		$.each(cols, function(j, col) {
			if(j == 0) {
				return;
			}
			var data = obj[j];
			if(col.mRender) {
				data = col.mRender(data, 1, obj);
			}
			if(col.sTitle != "") {
				html1.push("<tr><td class='lt-label'>" + 
					col.sTitle + "<td class='lt-value'>" + data + "</td></tr>");
			} else {
				html1.push("<tr><td class='lt-value-ext'>" + data + "</td></tr>");
			}
		});
		return html1.join("");	
	}	
	
	var Total, Start, selCount = 10;
	
	function resetPaging(total, start, length) {
		$("#" + id + "_pag_msg").html("Showing " + (start + 1) + 
			" to " + (start + length) + " of " + total + " entries");
		
		Total = total; Start = start;
		
		var f3 = (start != 0)? " class='enabled'": "";
		var html = "<span" + f3 + ">First</span><span" + f3 + ">Previous</span>\
				<span" + f3 + ">1</span>";
		
		var numOfPages = Math.ceil(total / selCount);
		var currPage = (start / selCount) + 1;
		
		var html1 = [];
		for(var i = 2; i < 5; i++) {
			if(i < numOfPages && i != currPage) { 
				html1.push("<span class='enabled'>" + i + "</span>");
			} else {
				html1.push("<span>" + i + "</span>");
			}
		}
		
		var nextClass = (currPage < numOfPages)? " class='enabled'": "";
		html1.push("<span" + nextClass + ">Next</span>");
		
		var lastClass = (currPage == numOfPages)? "": " class='enabled'";
		html1.push("<span" + lastClass + ">Last</span>");
		
		$("#" + id + "_pag").html(html + html1.join(""));

	}
	
	load(0, 10);
	
	var table = {
		getRowForColIndx: function(colInd, value) {
			var rows = currRows;
			var result = null;
			$.each(rows, function(ind, row) {
				if(row[colInd] == value) {
					result = row;
					return false;
				}
			});
			return result;
		},
		
		fnReloadAjax: function() {
			load(0);
		},
		
		render: function(arr) {
			render(arr);
		},
		
		fnSettings: function() {
			return cfg;
		}
	};
	
	return table;
}

