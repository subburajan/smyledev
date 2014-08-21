 

var Util = require("../common/Util");
var _ = require("underscore");

module.exports = function(app) {
    
    var Uploader = require("../controller/uploader")();
    
    app.post("/uploader", Uploader.middleware(), function(req, res) {
        var files = req.files;
        var result;
        if(!files) {
            result = Util.failure("Failed to Upload");
        } else {
            result = {};
            _.map(files, function(map, key) {
                var row = {};
                row.id = map.id;
                row.type = map.type;
                row.size = map.size;
                row.name = map.name;
                result[key] = row;
            });
            result = Util.success(result);
        }
        if(req.query.ajax == "1") {
            res.send(result);
        } else {
            result = "window.parent." + req.query.cb + "(" + result + ")";
            res.render("fwk/common/uploader", { result: result, layout: false });   
        }
    });
    
    app.get("/uploader/file/:id", function(req, res) {
        Uploader.getFile(req.params.id, res);
    });
    
    app.get("/uploader/files", function(req, res) {
        Uploader.getFiles(req, res, function(err, items) {
            if(err) {
                res.send(Util.failure(err, "Server Internal Error"));
            } else {
                res.send(Util.success(items));   
            }
        });
    });

    app.get("/uploader/remove/:id", function(req, res) {
        Uploader.removeFile(req.params.id, function(err) {
            var msg;
            if(err) {
                msg = Util.failure(err, "Failed to delete file");
            } else {
                msg = Util.success("Deleted Successfully");
            }
            res.send(msg);
        });
    });    
    
};