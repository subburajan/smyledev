
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

var PwdResetMgr = {
    init: function() {
        this.pwd1 = new TextInpExt({ id: "pwd1", name: "New Password", type: "secret", required: true }, _submit);
        this.pwd2 = new TextInpExt({ id: "pwd2", name: "New Password (Again)", type: "secret", required: true }, _submit);
        
        function _submit() {
        	PwdResetMgr.reset();
        }
        
        $("#reset").on("click", _submit);
    },
    
    validate: function() {
    	this.setErr("");
    	if(this.pwd1.validate() && this.pwd2.validate()) {
    		if(this.pwd1.getValue() != this.pwd2.getValue()) {
    			return this.setErr("Passwords doesn't match");
    		}
    		return true;
    	}
    	return false;
    },
    
    reset: function() {
        if(!this.validate()) {
            return;
        }
        var data = "pwd=" + encodeURIComponent(this.pwd1.getValue());
        $.ajax({
        	type: "POST",
        	url: "/fpwd/reset/" + ID,
        	data: data,
        	success: function(r) {
        		r = $.parseJSON(r);
        		if(r.status == "OK") {
        			var msg = "Your password has been reset successfully<br>\
        			Please use your new password to login<br>\
        			<div class='fpwd-login'><a href='/login'>Click here to Login</a></div>";
        			$("#pwd_reset_cntr").html("<div class='succ-msg'>" + msg + "</div>");	
        		} else {
        			self.setErr();
        		}
        	}
        });
    },
    
    setErr: function(msg) {
    	$("#err_msg").html(msg);
    }
};

$(document).ready(function() {
	PwdResetMgr.init();
});
