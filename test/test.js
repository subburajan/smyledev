
var PaymentController = require("../app/controller/payment");

var Util = require("../app/common/Util");
var Constants = require("../app/common/Constants");

var MailMgr = require("../app/manager/mail").mail;

var _ = require("underscore");

module.exports = function(app) {

	app.get('/admin/test/payments', function(req, res) {
		res.render("test/payments", {
			stripeKey: Constants.config.Stripe.publicKey
		});
	});
	
	app.get("/admin/testmail", function(req, res) {
		MailMgr.send({
				email: "smylanda@gmail.com",
				text: " Welcome to Trustlr, Thank you for becoming a member of Trustlr, \nYour New " +
					"Account has been created Successfully. Please click the following link to activate it .\n" +
					"<A href='http://localhost:8080/signup/activate/1234?ac=1234'>Account Activation Link</A>"
			}, function(err, res) {
				if(err) {
					res.send("Failed to send Email: " + err);
				}
				res.send("Activation Email Sent");
			}
		);		
	});	
	
};
