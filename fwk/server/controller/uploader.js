
var multipart = require("connect-multipart-gridform");
var mongodb = require("mongoose").mongo;

var Constants = require("../../../etc/Constants");

function initGridFS() {
    var MongoClient = mongodb.MongoClient;
    var url = Constants.config.db;
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        Uploader.init(db);
    });
};

var middleware;
     
var Uploader = {
    init: function(db) {
        middleware = multipart({ db: db, mongo: mongodb });
        this._db = db;
    },
    
    middleware: function() {
        return function(req, res, next) {
            middleware(req, res, next);       
        };
    },
    
    getStream: function(id) {
       	return multipart.gridform.gridfsStream(this._db, mongodb).createReadStream(id);
    },
    
    getFile: function(id, res) {
    	var readstream = this.getStream(id);

        readstream.on('open', function() {
            var store = readstream._store;
            res.setHeader('Content-Type', store.contentType);
        });
        
        readstream.on('error', function (err) {
        	console.log('ERR#: File not found ', err);
        	res.end("File Not found " + id);
        });
        readstream.pipe(res);
    },
    
    getFiles: function(next) {  
        req.locals = {};
        this._db.collection('fs.files', function(err, collection) {
            if(err) return next(err);
            collection.find({}, function(err, cursor) {
                if(err) return next(err);
                cursor.sort({uploadDate:-1}).limit(100);
                cursor.toArray(function(err, items) {
                    if(err) return next(err);
                    next(false, items);
                });
            });
        });
    },
    
    removeFile: function(id, next) {
        var self = this;
        this._db.collection('fs.files', function(err, collection) {
            if (err) return next(err);
             collection.remove({_id : mongodb.ObjectID(id) }, function(err) {
                if (err) return next(err);
                self._db.collection('fs.chunks', function(err, collection) {
                    if (err) return next(err);
                    collection.remove({ files_id: mongodb.ObjectID(id) }, next);
                });
            });
        });  
    }
};
    
module.exports = function() {
    if(!Uploader._db) {
        initGridFS();
    }    
    return Uploader;
};
