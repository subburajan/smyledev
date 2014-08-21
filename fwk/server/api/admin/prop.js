

var AppPropsController = require("../../controller/AppProps");
var Util = require("../../common/Util");

var MailMgr = require("../../manager/mail").mail;

module.exports = function(app, passport) {

	app.post("/prop", function(req, res) {
		var data = Util.parseReqJson(req.body.data);;
		AppPropsController.setCFG(data.name, data.value, function(result) {
			Util.returnResponse(false, result, res);
		});
	});

	app.get("/prop", function(req, res) {
		AppPropsController.getAll(function(result) {
			 Util.returnResponse(false, result, res);
		});
	});

	app.get('/prop_ui', function(req, res) {
		res.render("admin/props", { cfg: JSON.stringify({
			name: "Properties",
			postURL: "/admin/props",
			getURL: "/admin/props", 
			fields: [
					{ id: "name", name: "Name", type: "String", itype: "text", required: true },
					{ id: "value", name: "Value", type: "String", itype: "textarea", required: true }
				]
		})
		});
	});

	app.post("/mail", function(req, res) {
		var data = Util.parseReqJson(req.body.data);
		MailMgr.send({
				email: data.email,
				subject: data.subject,
				text: data.msg
			}, function(err, result) {
				Util.returnResponse(err, result, res);
			}
		);	
	});

};

