var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('./user.js');
var config = require('./oauth.js');

// config
module.exports = 

passport.use(new FacebookStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
        console.log(profile.displayName + " has logged in.");
        User.findOne({
            fb_authID: profile.id
        }, function(err, user) {
            if (err) {
                console.log(err);
            }
            if (!err && user != null) {
                done(null, user);
            } else {
                var user = new User({
                    fb_authID: profile.id,
                    name: profile.displayName,
                    created: Date.now(),
                    projects: []
                });
                user.save(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("saving user ...");
                        done(null, user);
                    };
                });
            };
        });
    }
));