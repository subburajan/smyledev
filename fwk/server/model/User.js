
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var AuthEnum = ['facebook', 'google', 'twitter'];
var SALT_WORK_FACTOR = 10;

var Constants = require("../../../etc/Constants");

var cols = {
	name: { type: String, default: '', required: true },
	email: { type: String, default: '', required: true },
	password: { type: String, default: '', required: true },
	_salt: { type: String, default: '' },
	authToken: { type: String, default: '' },
	provider: { type: Number, default: -1 },
	facebook: { },
	google: { },
	twitter: { },
	role: { type: Number, default: 0, required: true },
	image: { name: String, id: Schema.Types.ObjectId },
	phone: { type: String, default: '' },
	gender: { type: Boolean, default:  true },
	active: { type: Boolean, default:  false },
	
	objid: { type: Schema.Types.ObjectId },
	add_info: { type: Schema.Types.Mixed },
	
	log_time: { type: Date }
};

if(Constants.project.userprofile) {
	cols.profile = {
		type: Schema.Types.ObjectId, ref: "UserProfile"
	};
}

var UserSchema = new Schema(cols);

mongoose.connection.on('error', function(err) {
    console.error('MongoDB error: %s', err);
});

UserSchema.pre('save', function(next) {
	var self = this;
	if(!self.isModified("password")) {
		return next();
	}
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if(err) {
			return next(salt);
		}
		bcrypt.hash(self.password, salt, function(err, hash) {
			if(err) {
				return next(err);
			}
			self.password = hash;
			next();
		});
	});
});

UserSchema.methods.authenticate = function(pwd1, func) {
	bcrypt.compare(pwd1, this.password, function(err, matched) {
		if(err) {
			return func(err);
		}
		func(null, matched);
	});
};


UserSchema.methods.getPermissions = function(write, read, create) {
	var r = this.role;
	return {
		r: read.indexOf(r) > -1,
		w: write.indexOf(r) > -1,
		c: create && create.indexOf(r) > -1
	};
};


var EMAIL_RX = /(([a-zA-Z0-9\-?\.?]+)@(([a-zA-Z0-9\-_]+\.)+)([a-z]{2,3}))+$/;

UserSchema.path('email').validate(function(email) {
	if(this.provider > -1) {
		return true;
	}
	return email.length;
}, 'Email cannot be blank');


UserSchema.path('email').validate(function(email) {
	if(this.provider > -1) {
		return true;
	}
	return EMAIL_RX.test(email);
}, 'Invalid Email');

UserSchema.path('email').validate(function(email, func) {
	if(this.provider > -1) {
		func(true);
	} else if(this.isNew || this.isModified('email')) {
		var User = mongoose.model('User');
		User.find({email: email}).exec(function(err, list) {
			func(!err && list.length == 0);
		});
	} else {
		func(true);
	}
}, 'Email already exists');

UserSchema.path('password').validate(function(pwd) {
	if(this.provider > -1) {
		return true;
	}
	return pwd.length;
}, 'Password cannot be blank');


var model = mongoose.model('User', UserSchema);

model.paginate = require("../common/Paginate")(model);
