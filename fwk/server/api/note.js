

var NoteController = require("../controller/note");

var Util = require("../common/Util");

module.exports = function(app) {

	app.get("/note/:objId", function(req, res) {		
		NoteController.getOrdered(req.params.objId, function(err, result) {
			Util.returnResponse(err, result, res);
		});
	});

	app.post("/note/:objId", function(req, res) {
		var data = {
			msg: req.body.data,
			objId: req.params.objId,
			crBy: req.user.id
		};
		NoteController.create(data, function(err, result) {
			if(!err) {
				result = {
					_id: result._id,
					created: result.created,
					crBy: { _id: data.crBy, name: req.user.name }
				};
			}
			Util.returnResponse(err, result, res);
		});		
	});

	app.post("/note/:id/remove", function(req, res) {
		NoteController.remove(req.params.id, function(err, result) {
			Util.returnResponse(err, result, res);
		});		
	});

};