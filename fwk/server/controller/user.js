
var mongoose = require('mongoose');
var UserMO = mongoose.model("User");
var ActivationMO = mongoose.model("Activation");

var _ = require("underscore");

var Abstract = require("./_Abstract");
var Constants = require("../../../etc/Constants");

var MailMgr = require("../manager/mail").mail;

function User() {
	Abstract.apply(this, arguments);
}

_.extend(User.prototype, Abstract.prototype, {
	
	create: function(data, cb) {
		var args = [data, function(err, result) {
			if(err) {
				return cb(err);
			}
			sendEmail({
				name: result.name,
				email: result.email, 
				password: data.password
			}, cb);
		}];
		Abstract.prototype.create.apply(this, args);
	},
	
	sendPwdReset: function(email, cb) {
        this.getOne({ email: email }, "name", function(err, user) {
        	if(err || !user) {
        		return cb("Email id is not found");
        	}
        	sendPwdResetMail(email, user, cb);
		});
	},
	
	resetPwd: function(data, cb) {
		
	},
	
	getUserForPwdReset: function(data, cb) {
		var self = this;
		ActivationMO.findOne({ _id: data.actid, code: data.code }, function(err, act) {
			if(err || !act) {
				return cb("Invalid Authorized Code");
			}
			self.getOne({ _id: act.targetid }, "name", cb);
		});
	}
});

module.exports = new User(UserMO);

function sendEmail(user, cb) {
	MailMgr.send({
			email: user.email,
			subject: 'Your Skool Application Account',
			text: "Hi " + user.name + ",\n\t" +
				"We have created your new Account for Skool Application\n User Name: " + user.email + 
				"\n Password: " + user.password + " \n\n Thanks\nSkool Application\n" + 
				Constants.config.WWW + "/admin"
		}, function(err, res) {
			if(err) {
				console.log(err);
				return cb("Failed to send Email");
			}
			cb(false, "Email Sent");
		}
	);
}

function sendPwdResetMail(email, user, cb) {
	ActivationMO.create({
		targetid: user._id
	}, function(err, result) {
		if(err) {
			console.log(err);
			return cb("Failed to create Password Reset URL");
		}
		MailMgr.send({
				email: email,
				subject: 'Password Reset for Skool Application Account',
				text: "Dear " + user.name + ",\n\t" +
					"As you request, this is your password reset URL. \
					\n\tPlease click this url to reset your password withn in 24 hours.\n" + 
					Constants.config.WWW + "/fpwd/reset/" + result._id + "?ac=" + result.code + ""
			}, function(err, res) {
				if(err) {
					console.log(err);
					return cb("Failed to send Email");
				}
				cb(false, "Password Reset Email Sent");
			}
		);
	});
}
