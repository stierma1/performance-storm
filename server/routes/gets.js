
var FileStorage = require("../drivers/file-storage");
var Runtime = require("../runtime/engine");
var fs = require("fs");
var StandardReport = require("../reports/standard-report");
var JmeterReport = require("../reports/jmeter-report");

module.exports = (app) => {
  app.get("/credentials", function(req, res){
    var fileStorageDriver = new FileStorage({});
    res.json(fileStorageDriver.getCredentials());
  });

  app.get("/test-files", function(req, res){
    var fileStorageDriver = new FileStorage({});
    res.json(fileStorageDriver.getTestFiles());
  });

  app.get("/jmeter-servers", function(req, res){
    var fileStorageDriver = new FileStorage({});
    res.json(fileStorageDriver.getJmeterServers());
  });

  app.get("/target-servers", function(req, res){
    var fileStorageDriver = new FileStorage({});
    res.json(fileStorageDriver.getTargetServers());
  });

  app.get("/results/batches", function(req, res){
    var fileStorageDriver = new FileStorage({});
    res.json(fileStorageDriver.getBatches()
      .map(function(batchId){
        return JSON.parse(fs.readFileSync((new FileStorage({batchId:batchId})).getBatchInfoPath(), "utf8"));
      }));
  });

  app.get("/batches", function(req, res){
    res.json(Runtime.getBatches().map(function(batchObj){
      var obj = {};
      for(var key in batchObj){
        if(key !== "worker"){
          obj[key] = batchObj[key];
        }
      }

      return obj;
    }));
  });

  app.get("/runs", function(req, res){
    res.json(Runtime.getRuns().map(function(runObj){
      var obj = {};
      for(var key in runObj){
        if(key !== "worker" && key !== "batch"){
          obj[key] = runObj[key];
        }
      }

      return obj;
    }));
  });

  app.get("/batchs/:batchId/runs", function(req, res){
    res.json(Runtime.getRuns(req.params.batchId));
  });

  app.get("/archive", function(req, res){
    res.json(
      (new FileStorage()).getArchive()
        .map(function(val){
          var standardReport = new StandardReport(val.id);
          val.name = standardReport.getMeta().name;
          return val;
        })
    );
  });

  app.get("/archive/:batchId", function(req, res){
    var fileStorageDriver = new FileStorage({batchId: req.params.batchId});
    res.sendFile(fileStorageDriver.getArchivePath());
  });

  app.get("/results/batches/:batchId/runs", function(req, res){
    var fileStorageDriver = new FileStorage({batchId:req.params.batchId});
    res.json(fileStorageDriver.getBatchRuns());
  });

  app.get("/results/batches/:batchId/runs/:runId", function(req, res){
    var fileStorageDriver = new FileStorage({batchId:req.params.batchId, runId:req.params.runId});
    res.json(fileStorageDriver.getBatchRunFilePaths());
  });

  app.get("/results/batches/:batchId/runs/:runId/jmeter-results.xml", function(req, res){
    var fileStorageDriver = new FileStorage({batchId:req.params.batchId, runId:req.params.runId});
    var jmeterResultsPathPromise = fileStorageDriver.genJmeterResultsPath();
    jmeterResultsPathPromise.then((jmeterResultsPath) => {
      res.sendFile(jmeterResultsPath);
    })
    .catch((err) => {
      res.status(500).send(err);
    });

  });

  app.get("/results/batches/:batchId/runs/:runId/sys-results.json", function(req, res){
    var fileStorageDriver = new FileStorage({batchId:req.params.batchId, runId:req.params.runId});
    var targetResultsPathPromise = fileStorageDriver.genTargetServerResultsPath();
    targetResultsPathPromise.then((targetResultsPath) => {
      res.sendFile(jmeterResultsPath);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
  });

  app.get("/reports/standard-report/:batchId", function(req, res){
    var standardReport = new StandardReport(req.params.batchId);
    standardReport.loadGeneralInfo();
    res.json(standardReport.generate());
  });

  app.get("/reports/jmeter-report/:batchId", function(req, res){
    var jmeterReport = new JmeterReport(req.params.batchId);
    jmeterReport.loadGeneralInfo();
    res.json(jmeterReport.generate());
  });

  app.get("/failures", function(req, res){
    var fileStorageDriver = new FileStorage();
    var failures = fileStorageDriver.getFailures();
    var failureObjs = failures.map(function(failure){
      var fileStorage = new FileStorage({batchId:failure});
      return JSON.parse(fs.readFileSync(fileStorage.getFailurePath(), "utf8"));
    });
    res.json(failureObjs);
  });
}
