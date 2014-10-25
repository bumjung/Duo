var mongoose = require('mongoose');

var User = mongoose.model('Users', {
    fb_authID: Number,
    name: String,
	created:Date,
    projects: [
        {
            name: String,
            authors:[String],
            created: Date
        }
    ]
});

module.exports = User;