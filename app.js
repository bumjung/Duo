var path = require('path'),
    fs = require('fs'),
	express = require('express'),
	app = express(),
	server = require('http').Server(app),
	io = require('socket.io')(server),
    passport = require('passport'),
	_ = require('underscore'),
	mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    Router = require('./app/routes.js'),
	config = require('./app/oauth.js'),
	User = require('./app/user.js'),
    db = require('./app/database.js'),
	auth = require('./app/authentication.js'),
    t = require('./app/tree.js');

mongoose.connect('mongodb://localhost/database');

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function callback () {
    console.log('connected to db');
});
var ObjectId = mongoose.Types.ObjectId;

//setup express app
app.use(express.static(path.join(__dirname, '/public')) );
app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride('X-HTTP-Method-Override'));

app.use(session({secret: 'my_precious'}));
app.use(passport.initialize());
app.use(passport.session());

// serialize and deserialize
passport.serializeUser(function(user, done) {
    //console.log('serializeUser: ' + user._id);
    done(null, user._id);
});
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        if (!err) done(null, user);
        else done(err, null);
    })
});


//SET UP ROUTER FOR REST API
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next();
});
Router(router, User, ObjectId);
app.use('/api', router);


app.get('/dashboard', ensureAuthenticated, function(req, res) {
    User.findById(req.session.passport.user, function(err, user) {
        if (err) {
            console.log(err);
            } else {
                res.render('dashboard.html', {
                user: user
            });
        };
    });
});
app.get('/', function(req, res) {
    res.render('index.html', {
        user: req.user
    });
});
app.get('/project', function(req, res) {
    res.render('project.html', {
        user: req.user
    });
});
app.get('/auth/facebook',
    passport.authenticate('facebook'),
    function(req, res) {}
);
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/'
    }),
    function(req, res) {
        console.log("in");
        res.redirect('/dashboard');
    }
);
app.get('/logout', function(req, res) {
    req.logout();
    console.log("logging out...");
    res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/')
}

io.sockets.on("connection", function(socket){
    var dict = {};

    var tree = t.renderTree('./', 0, dict);

    console.log(tree.render);
    console.log(tree.dict);

    socket.emit('render', {html: tree.render});

    socket.on('file', function(id){
        fs.readFile(tree.dict[id].path, 'utf8', function(err,content){
            if(err){
                console.log(err);
            }
            else{
                socket.emit('content',{content:content, type:dict[id].type});
            }
        });

        /*socket.emit('author-position',{ USER, id: id,html: "<i class='author-position fa fa-square'> P.K</i>"});*/
    });
});


var port = 9000;
server.listen( port, function(){
    console.log("listening on", port);
});