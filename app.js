var favicon = require('serve-favicon')
var morgan = require('morgan');
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var expressJson = require('express-json');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');
var bodyParser = require('body-parser');
var path = require('path');
var url = require('url');
var fs = require('fs');

var app = express();
var redis = require('redis');
var client = redis.createClient();

var config = function(app) {
    app.set('port', 3000);
    //app.use(favicon(path.join(__dirname, './public/favicon.ico')));
    app.use(morgan('dev', {immediate: true}));
    app.use(expressJson());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(cookieParser('totes secret'));
    app.use(session({
        secret: 'yeaaaboy',
        resave: true,
        saveUninitialized: false
    }));

    app.use(express.static(path.join(__dirname, '../public')));

    if(app.get('env') === 'development') {
        app.use(errorHandler());
    }
};

config(app);
var server = require('http').Server(app);
var io = require('socket.io')(server);

var items = [];

app.post('/', function(req, res) {
    items.push(req.body.newItem);
    res.status(200);
    res.redirect('/');
});

app.get('/', function(req, res) {
    res.status(200);
    fs.readFile('./public/index.html', function(err, html) {
        if(err) { throw err; }
        res.writeHeader(200, {"Content-Type": "text/html"});
        res.write(html);
        res.end();
    });
});

io.on('connection', function(socket) {
    console.log('on connection');
    client.lrange("list", 0, 10000, function(err, items) {
        socket.emit('items', {
            items: items
        });
    });
    socket.on('new item', function(data) {
        console.log(data);
        items.push(data);
        client.rpush("list", data);
    });
});

var port = app.get('port');
var ret = server.listen(port, function() {
    console.log('font end connected on port ' + port)
});