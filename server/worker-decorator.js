
var JmeterClient = require("./drivers/jmeter-client");
var TargetServerClient = require("./drivers/target-server-client");
var FileStorage = require("./drivers/file-storage");
var Archive = require("./post-processing/archiving");
var CommonRunFields = require("./post-processing/reporting/run-fields");
var fs = require("fs");
var _ = require("lodash");
var path = require("path");
var mediator = require("./mediator");

var EE = require("events").EventEmitter;

module.exports = function(worker){
  worker.ee = new EE();

  worker.run = function(){
    return this.jmeterClient.run();
  };


  worker.killRun = function(){
    try{
      this.jmeterClient.killRun();
    } catch(err){
      mediator.emit("error", "Worker received error killing the jmeter run: " + err.toString())
    }

    try{
      this.targetServerClient.killRun();
    } catch(err){
      mediator.emit("error", "Worker received error killing the target server run: " + err.toString())
    }

  }

  worker.publishRun = function(){
    return this.targetServerClient.getResults().then((val) => {
        return this.jmeterClient.getResults()
          .then((val2) => {
            return [val2, val];
          });
      })
      .then((resultsArr) => {
        var jmeterResults = resultsArr[0];
        var targetServerResults = resultsArr[1];
        var fileStorageDriver = new FileStorage({batchId:this.current_batch.id, runId:this.current_run.id});
        var runResults = fs.readFileSync(fileStorageDriver.getTargetServerResultsPath() + "/sys-results.json", "utf8");
        var runFields = new CommonRunFields(JSON.parse(runResults))
        fs.writeFileSync(fileStorageDriver.getTargetServerResultsPath() + "/general-run-report.json", JSON.stringify(runFields.generalReport(), null, 2))
        this.ee.emit("publish-run", {
          run: this.current_run,
          batch: this.current_batch,
          worker: this,
          jmeterResults: jmeterResults,
          targetServerResults: targetServerResults
        });
      });
  };

  worker.publishBatch = function(){
    return Promise.resolve()
      .then(() => {
        var fileStorageDriver = new FileStorage({batchId:this.current_batch.id});
        fs.writeFileSync(fileStorageDriver.getBatchPath() + "/done.json", JSON.stringify({endTime:new Date()}, null, 2));
        Archive.publish({
          location: fileStorageDriver.getBatchPath(),
          batch: this.current_batch,
          worker: this
        });
      });
  };

  worker.publishKill = function(reason){
    console.log(this.current_batch.id ,reason)
  }

  worker.verify = function(){
    this.jmeterClient = new JmeterClient({host:this.jmeterHost, credential:this.credential, workerId:this.id, batchId:this.current_batch.id});

    return this.jmeterClient.initialize();
  };

  worker.verifyRun = function(){
    var currRun = this.current_run;
    bindRunToServer(currRun);
    this.jmeterClient.consumeRun(currRun);
    this.targetServerClient = new TargetServerClient({credential:currRun.credential, workerId: this.id, batchId:this.current_batch.id, runId:currRun.id,host:currRun.targetServerHost})

    return this.jmeterClient.verifyRun()
      .then(() => {
        return this.targetServerClient.initialize();
      });
  };
}

function bindRunToServer(run){
  var fileStorageDriver = new FileStorage();
  var targetServerPath = fileStorageDriver.getTargetServerPath(run.targetServer);
  var serverObj = JSON.parse(fs.readFileSync(targetServerPath, "utf8"));
  //Existing credentials override server default creds
  var creds = run.credential;
  _.extend(run, serverObj);
  if(creds){
    run.credential = creds;
  }

}
