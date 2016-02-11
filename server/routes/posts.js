
var bodyParser = require("body-parser");
var Runtime = require("../runtime/engine");
var Busboy = require("busboy");
var FileStorage = require("../drivers/file-storage");
var fs = require("fs");

function uploadTestFile(req, res){
  var busboy = new Busboy({headers: req.headers});
  var fileUploadPromise = null;
  var fileName;
  var fileStorageDriver = new FileStorage();

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    fileName = filename;
    var bufs = [];
    fileUploadPromise = new Promise((res, rej) => {
      file.on("data", function(d) {
          bufs.push(d);
      });
      file.on("end", function() {
        var buf = Buffer.concat(bufs);
        res(buf);
      });
      file.on("error", function(err) {
        rej(err);
      });
    });
  });

  busboy.on("finish", function(){
    fileUploadPromise
      .then(function(contents){
        var testFilePath = fileStorageDriver.getTestFilePath(fileName);
        fs.writeFileSync(testFilePath, contents, "binary");
        res.status(200).end();
      })
      .catch(function(err){
        console.log(err)
        res.status(500).send(err);
      });
  });

  return req.pipe(busboy);
}


module.exports = (app) => {
  app.post("/batches", bodyParser.json({
    limit: "128kb"
  }), (req, res) => {
    var body = req.body;
    var batchId = Runtime.addBatch(body);
    res.status(200).send(batchId);
  });

  app.post("/servers/:serverName", bodyParser.json({
    limit: "128kb"
  }), (req, res) => {
    var body = req.body;
    var workerId = Runtime.addServer(body, req.params.serverName);
    res.status(200).send(workerId);
  });

  app.post("/credentials/:credentialName", bodyParser.json({
    limit: "512kb"
  }), (req, res) => {
    var body = req.body;
    var fileStorageDriver = new FileStorage();
    fs.writeFileSync(fileStorageDriver.getCredentialsPath(req.params.credentialName), JSON.stringify(body));
    res.status(200).end();
  });

  app.post("/test-files", uploadTestFile);
}
