var favicon = require('serve-favicon');
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

var config = function(app) {
    app.set('port', process.env.PORT || 3000);
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

var app = express();
var redis = require('redis');
var client;

config(app);
var server = require('http').Server(app);
var io = require('socket.io')(server);

if(process.env.REDISTOGO_URL) {
    var rtg = require("url").parse(process.env.REDISTOGO_URL);
    var redis = require("redis").createClient(rtg.port, rtg.hostname);

    redis.auth(rtg.auth.split(":")[1]);
    io.set('transports',[
        'xhr-polling'
    ]);
    io.set("polling duration", 10);
    /*io.configure(function () { 
        io.set("transports", ["xhr-polling"]); 
        io.set("polling duration", 10); 
    });*/
} else {
    client = redis.createClient();
}

app.get('/', function(req, res) {
    res.status(200);
    fs.readFile('./public/index.html', function(err, html) {
        if(err) { throw err; }
        res.writeHeader(200, {"Content-Type": "text/html"});
        res.write(html);
        res.end();
    });
});

app.get('/lists', function(req, res) {
    client.lrange("lists", 0, -1, function(err, lists) {
        res.json(lists);
    });
});

app.post('/lists', function(req, res) {
    //client.rpush("lists", req.body);
    console.log(req.body);
    res.json({status: "success"});
});

app.post('/lists/:list', function(req, res) {
    items.push(req.body.newItem);
    res.status(200);
    res.redirect('/');
});

app.get('/lists/:list', function(req, res) {
    res.status(200);
    fs.readFile('./public/list.html', function(err, html) {
        if(err) { throw err; }
        res.writeHeader(200, {"Content-Type": "text/html"});
        res.write(html);
        res.end();
    });
});

io.on('connection', function(socket) {
    console.log('on connection');
    client.lrange("list", 0, -1, function(err, items) {
        socket.emit('items', {
            items: items
        });
    });
    socket.on('delete item', function(data) {
        client.lrange("list", 0, -1, function(err, items) {
            client.lrem("list", 1, items[data], function(err, data) {
                console.log('in lrem');
                client.lrange("list", 0, -1, function(err, items) {
                    io.emit('items', {
                        items: items
                    });
                });
            });
        });
    });
    socket.on('new item', function(data) {
        console.log(data);
        items.push(data);
        client.rpush("list", data);
        client.lrange("list", 0, -1, function(err, items) {
            io.emit('items', {
                items: items
            });
        });
    });
});

var port = app.get('port');
var ret = server.listen(port, function() {
    console.log('font end connected on port ' + port);
});