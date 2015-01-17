var express = require('express');
var fs = require('fs');
var router = express.Router();


router.post('/compile', function(req, res) {
    var path = ["files",req.body.username].join('/')
            var exec = require('child_process').exec;
            exec(['/usr/bin/pdflatex -halt-on-error -output-directory',path,[path, req.body.documentName].join('/')].join(' '), function(error, stdout, stderr) {
                res.send({
                    stdout: stdout ,
                    error: error ,
                    stderr: stderr
                })
            });
        });

router.get('/read/:username/:documentName', function(req, res) {
    var path = ["files", req.params.username, req.params.documentName].join('/')
    fs.readFile(path, { encoding: "utf-8" }, function(err, data) {
        if(err) {
            res.send({
                status: "fail",
                message: "file not found"
            })
        }
        else {
            res.send({
                status: "ok",
                username: req.params.username,
                documentName: req.params.documentName,
                contents: data
            });
        }
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
                status: "ok",
                documentName: req.body.documentName
            });
        }
    });
});

module.exports = router;
