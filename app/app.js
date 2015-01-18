var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var routes = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/api');
var fs = require('fs');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(multer( {
    dest: 'uploads/',
    rename: function(fieldname, filename) { return filename }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'files')));

app.use('/', routes);
app.use('/users', users);
app.use('/api', api);

// Handle sendgrid API posts directly here, to interact with the websockets.
app.post('/api/inbound', function(req, res) {
    // If we have some pictures!
    try {
        if(req.body.attachments) {
            var name = req.body.subject; // subject line is username of sender
            var filenames = [];
            // such a user is connected
            if(app.clients[name]) {
                var attachments = JSON.parse(req.body["attachment-info"]);
                for(var i = 0; i < parseInt(req.body.attachments); i++) {
                    var filename = attachments["attachment" + (i + 1)].filename;
                    var src = ["uploads", filename].join('/');
                    var dest = ["files", name, "uploads", filename].join('/');
                    fs.rename(src, dest, function(err) { if(err) console.log(err); } );
                    filenames.push(dest);
                }

                app.clients[name].emit("image upload", {
                    filenames: filenames
                });

                res.send({
                    status: "ok",
                });
            }
            else {
                print("fail");
                res.send({
                    status: "fail",
                    message: "no client connected"
                });
            }
        }
        // doesn't really matter, since this is still a 200 and that's all Sendgrid
        // needs to be happy. We just need to avoid sending back a 500 or such.
        else {
            res.send({
                status: "fail",
                message: "no attachments"
            });
        }
    }
    catch(err) {
        res.send({
            status: "super fail",
            message: "hello"
        })
    }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
