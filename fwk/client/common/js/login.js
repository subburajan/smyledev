
var TextInp = INPUT_TYPES.text;

function TextInpExt(cfg, keyPressEvt) {
    TextInp.apply(this, arguments);
    this.id = cfg.id;
    $("#" + this.id).keypress(function(e) {
        if(e.which == 13) {
            keyPressEvt();
        }
    });
    return this;  
}

$.extend(TextInpExt.prototype, TextInp.prototype);

var LoginMgr = {
    init: function() {
        this.email = new TextInpExt({ id: "email", name: "Email", type: "email", required: true }, _submit);
        this.pwd = new TextInpExt({ id: "pwd", name: "Password", type: "secret", required: true }, _submit);
        
        function _submit() {
        	LoginMgr.submit();
        }
        
        $("#submit").on("click", _submit);
    },
    
    validate: function() {
      return this.email.validate() && this.pwd.validate(); 
    },
    
    submit: function() {
        if(this.validate()) {
            $("#loginform").submit();   
        }
    }
};

var FPwdMgr = {
	init: function() {
		$("#fpwd_butt").on("click", function(e) {
			FPwdMgr.show();
		});
	},
	
	show: function() {
		$("#fpwd_cntr").html(
			'<div class="row">\
               	<div class="lbl">Email</div>\
               	<div class="inp"><input type="text" id="fp_email" name="fp_email"></div>\
               	<div class="clear"></div>\
            </div>\
            <div class="fpwd-butts">\
                <a href="javascript:void(0)" id="fp_reset"><span class="butt butt-def">\
            	Send Password Reset Email</span></a>\
            </div>\
            <div id="fpwd_err" class="err-msg err"></div>'
		);
		var self = this;
		this.email = new TextInpExt({ id: "fp_email", name: "Email", type: "email", required: true }, 
						function() { self.reset(); });
					
		attachClkEvnt("fp_reset", function(evt, startCB, endCB) {
			startCB("Sending Password Reset Email");
			self.reset(function() {
				//endCB("");
			});
		});
	},
	
	reset: function() {
		$("#fpwd_err").html("");
		if(!this.email.validate()) {
			return;
		}
		var data = "email=" + encodeURIComponent(this.email.getValue());
		var self = this;
		$.ajax({
			type: "POST",
			data: data,
			url: "/fpwd",
			success: function(r) {
				r = $.parseJSON(r);
				if(r.status == "OK") {
					self.setMsg("Your Password Reset URL is sent to you Email id <br>\
						Please use that url to reset your password");
				} else {
					self.setMsg(r.reason.err, true);
				}
			}
		});
	},
	
	setMsg: function(msg, isErr) {
		if(!isErr) {
			$("#fpwd_cntr").html("<div class='succ-msg'>" + msg + "</div>");			
		} else {
			$("#fpwd_err").html(msg);
		}
	}
};

$(document).ready(function() {
	LoginMgr.init();
   	FPwdMgr.init();
});
