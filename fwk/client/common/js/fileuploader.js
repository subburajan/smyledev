
function FileUploader(cfg) {
	this.cfg = cfg;
    this.id = cfg.id;
    this.cb = cfg.callback;
    this.types = cfg.types;
    if(cfg.id && $1(cfg.id)) {
	    this.init();
	}
    return this;
}

FileUploader.prototype = {
    init: function() {
        var inp = $("#" + this.id);
        var ifrid = this.id + "_ifr";
        var cb = this.id + "_cb";

        var form = $("<form method='post' action='/uploader?cb=" + cb + "' target='" + ifrid + "'\
            enctype='multipart/form-data' encoding='multipart/form-data'>");

        var div = $("<div class='uploader'><iframe name='" + ifrid + "'></iframe></div>");
        div.append(form);
        inp.before(div);

        form.append("<span class='up-browse butt butt-def'><a href='javascript:void(0)'>Browse</a></span>");
        var value = $("<div class='up-value'></div>");
        form.append(value);

        var butt = $("<div class='up-butt butt butt-def disabled'><a href='javascript:void(0)'>" + 
        	(this.cfg.butt_name || "Upload ") + "</a></div>");
        form.append(butt, inp);
        form.append("<div class='clear'></div>");

        var self = this;
        inp.on("change", function() {
            var val = self.getValidValue();
            if(!val) {
                butt.addClass('disabled');
            } else {
                self._setValue(val);
                butt.removeClass('disabled');
            }
        });

        butt.on("click", function(e) {
           	if(butt.hasClass("disabled")) {
           		return;
           	}
           	if(self.cfg.before) {
           		self.cfg.before(upload);
           	} else {
           		upload();
           	}
       	});
       
       	function upload() {
          	$("#" + this.id + "_progress").removeClass("hide");
           	self.hidePreview();
           	self.showProgress();
           	form.submit();
       	}

        window[cb] = function(result) {
            self.hideProgress();
            if(result.status == "FAIL") {
                self.setErr("Upload Failed. Please try again");
            } else {
                var data = result.message;
                self.showPreview(data);
                self.cb(data[self.id]);
                self.cfg.after && self.cfg.after(data);
                butt.addClass("disabled");
            }
        };
        this._div = div;
        this._value = value;
        this._butt = butt;
    },

    _setValue: function(val) {
        var i = val.lastIndexOf("/");
        if(i == -1) {
            i = val.lastIndexOf("\\");
        }
        if(i > -1) {
            val = val.substring(i + 1);
        }
        this._value.html(val);
    },
    
    showPreview: function() { },
    
    hidePreview: function() { },

    showProgress: function() {
        if(!this._progress) {
            this._progress = $("<div class='clear progress hide'><img src='/common/images/progress.gif'></div>");
            this._div.append(this._progress);
        }
        this._progress.removeClass("hide");
    },

    hideProgress: function() {
        if(this._progress) {
            this._progress.addClass("hide");
        }
    },

    setErr: function(msg) {
        var id = this.id + "_err";
        var je = $("#" + id);
        if(msg.length > 0) {
            if(je.length == 0) {
                this._div.append("<div class='err' id='" + id + "'>" + msg + "</div>");
            } else {
                je.html(msg);
                je.removeClass("hide");
            }
        } else if(je.length > 0) {
            je.addClass("hide");
        }
    },

    getValue: function() {
        return this._value.html();
    },

    getValidValue: function() {
        this.setErr("");
        var val = $("#" + this.id).val();
        if(val == "") {
            return false;
        }
        if(!this._isValidFile(val)) {
            this.setErr("Invalid File Selection");
            return false;
        }
        return val;
    },

    _isValidFile: function(val) {
        var l = this.types.length;
        if(this.types[0] == "*") {
            return true;
        }
        val = val.toUpperCase();
        for(var i = 0; i < l; i++) {
            var a = this.types[i].toUpperCase();
            if((val.indexOf(a) + a.length) == val.length) {
                return true;
            }
        }
        return false;
    },

    clear: function() {
		this._setValue("");
		this.hideProgress();
		this._butt.addClass("disabled");
	}
};


function ImageUploader() {
    FileUploader.apply(this, arguments);
    return this;
}

$.extend(ImageUploader.prototype, FileUploader.prototype, {});

ImageUploader.prototype.init = function() {
    FileUploader.prototype.init.apply(this, arguments);
};

ImageUploader.prototype.showPreview = function(data) {
    var first;
    for(var k in data) {
        first = data[k];
        break;
    }
    if(!first || first.id == null) {
        return this.hidePreview();
    }
    var id = first.id;
    var url = "/uploader/file/" + id;
    if(!this._preview) {
        var div = $("<div class='preview'></div>");
        this._preview = $("<img src='" + url + "'>");
        this._div.append(div);
		div.append(this._preview);

        if(this.cfg.canRemove) {
	        var remove = $("<div class='preview-remove'><a href='javascript:void(0)'>Remove</a></div>");
	        div.append(remove);
        	var self = this;
	        remove.on("click", function() {
	           self.removeFile(id);
	           self.clear();
	        });        	
        }
    } else {
        this._preview.parent().removeClass("hide");
        this._preview.attr("src", url);
    }
};

ImageUploader.prototype.removeFile = function(id) {
    var self = this;
    $.ajax({
        type: "GET",
        url: "/uploader/remove/" + id,
        success: function(response) {
            var response = $.parseJSON(response);
            if(response.status == "OK") {
                self.hidePreview();
                var ar = self.cfg.afterRemove;
                ar && ar(id);
            } else {
                self.setErr(response.reason);
            }
        }
    });
};

ImageUploader.prototype.hidePreview = function() {
    if(this._preview) {
        this._preview.parent().addClass("hide");
    }
};

ImageUploader.prototype.isHidden = function() {
    if(this._preview) {
        return this._preview.parent().hasClass("hide");
    }
};

ImageUploader.prototype.clear = function() {
	FileUploader.prototype.clear.apply(this, arguments);
	this.hidePreview();
};
