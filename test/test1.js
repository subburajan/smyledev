

var A = [
	{ "_id" : ObjectId("533d9866f0615d936b97c824"), "name" : 3 },
	{ "_id" : ObjectId("533d9860f0615d936b97c823"), "name" : 2 },
	{ "_id" : ObjectId("533d9853760f87196ba249d9"), "name" : 1 },
	{ "_id" : ObjectId("536b11d8720ece9541017988"), "name" : 14 },
	{ "_id" : ObjectId("536b11e4720ece9541017989"), "name" : 15 },
	{ "_id" : ObjectId("536b115e720ece954101797f"), "name" : 5 },
	{ "_id" : ObjectId("536b1150720ece954101797e"), "name" : 4 },
	{ "_id" : ObjectId("536b116b720ece9541017980"), "name" : 6 },
	{ "_id" : ObjectId("536b1175720ece9541017981"), "name" : 7 },
	{ "_id" : ObjectId("536b117f720ece9541017982"), "name" : 8 },
	{ "_id" : ObjectId("536b1189720ece9541017983"), "name" : 9 },
	{ "_id" : ObjectId("536b119f720ece9541017984"), "name" : 10 },
	{ "_id" : ObjectId("536b11a8720ece9541017985"), "name" : 11 },
	{ "_id" : ObjectId("536b11b1720ece9541017986"), "name" : 12 },
	{ "_id" : ObjectId("536b11be720ece9541017987"), "name" : 13 }
];


var B = [
	{ "_id" : ObjectId("536b12c56be5ab964127f34e"), "name" : "Teacher-LKG" },
	{ "_id" : ObjectId("536b13216be5ab964127f351"), "name" : "Teacher-STD-1" },
	{ "_id" : ObjectId("536b12ec720ece954101798a"), "name" : "Teacher-UKG" },
	{ "_id" : ObjectId("536b14b9ec398ca7627a0da4"), "name" : "Teacher-STD-2" },
	{ "_id" : ObjectId("536b14d89ddceaa5625dc6a4"), "name" : "Teacher-STD-3" },
	{ "name" : "Teacher-STD-4", "_id" : ObjectId("536b16a5ec398ca7627a0da7") },
	{ "_id" : ObjectId("536b16c5ec398ca7627a0daa"), "name" : "Teacher-STD-5" },
	{ "name" : "Teacher-STD-6", "_id" : ObjectId("536b3a5af896d04902ec9b74") },
	{ "_id" : ObjectId("536b3a81f582c34c0231a61d"), "name" : "Teacher-STD-7" },
	{ "name" : "Teacher-STD-8", "_id" : ObjectId("536b3ab9f896d04902ec9b77") },
	{ "name" : "Teacher-STD-9", "_id" : ObjectId("536b3aecf582c34c0231a620") },
	{ "name" : "Teacher-STD-10", "_id" : ObjectId("536b3b0ff896d04902ec9b7a") },
	{ "name" : "Teacher-STD-11", "_id" : ObjectId("536b3b41f896d04902ec9b7d") }
];

var _ = require("underscore");


function ObjectId(str) {
	return str;
}

var STD = {};
_.each(A, function(a) {
	STD[a.name] = A._id;
});

_.each(B, function(b) {
	var n = b.name;
	var ind;
	if(n.indexOf("-LKG") > -1) {
		ind = 2;
	} else if(n.indexOf("-UKG") > -1) {
		ind = 3;
	} else {
		ind = n.indexOf("-STD-");
		ind = parseInt(n.substring(ind + 5, n.length));
	}
	var stdid = A[ind]._id;
	
	console.log("db.teachers.update({ _id: ObjectId(\"" + b._id + 
		"\") }, { $set: { standard: ObjectId(\"" + stdid + "\") }});");
});

