var express = require('express');
var fs = require('fs');
var router = express.Router();

router.get('/read/:username/:documentName', function(req, res) {
    console.log("asdf");
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

router.post('/write', function(req, res) {
    var path = ["files", req.body.username, req.body.documentName].join('/')
    fs.writeFile(path, req.body.contents, function(err) {
        if(err) throw err;
    });
});

module.exports = router;
