
var mongoose = require('mongoose');
var LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport) {
	var UserMO = mongoose.model('User');

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		UserMO.findOne({ _id: id }, function(err, user) {
			done(err, user);
		});
	});

	passport.use(new LocalStrategy({
			usernameField: 'email',
			passwordField: 'pwd'
		}, function(email, password, done) {
			UserMO.findOne({email: email}, function(err, user) {
				if(err) {
					return done(err);
				}																	
				if(!user) {
					return done(null, false, { message: 'Unknown User' });
				}
				if(!user.active) {
					return done(null, false, { message: 'User is not active' });
				}
				user.authenticate(password, function(err, matched) {
					if(matched) {
						user.log_time = Date.now();
						return user.save(function() {
							done(null, user);
						});
					}
					return done(null, false, { message: "Password Doesn't match" });
				});
			});
		}
	));

};
