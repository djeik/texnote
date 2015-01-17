var express = require('express');
var fs = require('fs');
var router = express.Router();

router.get('/read/:username/:documentName', function(req, res) {
    var path = ["files", req.params.username, req.params.documentName].join('/')
    fs.readFile(path, { encoding: "utf-8" }, function(err, data) {
        if(err) throw err;

        res.send({
            username: req.params.username,
            documentName: req.params.documentName,
            contents: data
        });
    });
});

router.get('/list/:username', function(req, res) {
    var path = ["files", req.params.username].join('/')
    fs.readdir(path, function(err, files) {
        if(err) {
            res.send({
                status: "fail",
                message: "unable to get files",
                username: req.params.username
            });
        }
        else {
            res.send({
                status: "ok",
                username: req.params.username,
                files: files
            });
        }
    });
});

router.post('/write', function(req, res) {
    var path = ["files", req.body.username, req.body.documentName].join('/')
    fs.writeFile(path, req.body.contents, function(err) {
        if(err) {
            res.send({
                status: "fail",
                message: "unable to write file"
            });
        }
        else {
            res.send({
                status: "ok"
            });
        }
    });
});

module.exports = router;
