"use strict"
var nools = require("nools");

var flow = nools.compile(__dirname + "/rools.nools");
var uuid = require("uuid");

var Worker = flow.getDefined("Worker");
var Batch = flow.getDefined("Batch");
var ServerClaims = flow.getDefined("ServerClaims");
var WorkerReplace = flow.getDefined("WorkerReplace");
var RunTimeout = flow.getDefined("RunTimeout");
var BatchTimeout = flow.getDefined("BatchTimeout");

var session = flow.getSession();

var workerDecorator = require("../worker-decorator");
var serverClaimsDecorator = require("../server-claims-decorator");

var mediator = require("../mediator");
var FileStorage = require("../drivers/file-storage");
var fs = require("fs");
var Props = require("../../properties/dev-config");

mediator.on("error", (message, data) => {
  console.log(message, data)
});

mediator.on("data", (message, data) => {
  console.log(message)
});

class Runtime{
  constructor(){
    this.session = session;
    this.flow = flow;

    var fileStorageDriver = new FileStorage();
    //Take the Jmeter servers and make workers out of them on startup
    fileStorageDriver.getJmeterServers()
      .map((serverName) => {
        return fileStorageDriver.getJmeterServerPath(serverName);
      })
      .map((serverPath) => {
        return JSON.parse(fs.readFileSync(serverPath, "utf8"));
      })
      .map((serverInfo) => {
        this.addWorker(serverInfo);
      });

    var serverClaims = new ServerClaims();
    serverClaimsDecorator(serverClaims);
    this.session.assert(serverClaims);

    this.runTimeoutInterval = setInterval(() => {
      this.session.assert(new RunTimeout({currentTime:Date.now(), timeout:Props.runTimeout}));
    }, 5000);
    this.batchTimeoutInterval = setInterval(() => {
      this.session.assert(new BatchTimeout({currentTime:Date.now(), timeout:Props.batchTimeout}));
    }, 5000);

  }

  addWorker(workerObj){
    var Worker = flow.getDefined("Worker");
    var worker = new Worker(workerObj);
    workerDecorator(worker);
    worker.id = uuid.v4();
    session.assert(worker);
    session.match();
    return worker.id;
  }

  addBatch(batchObj){
    var Batch = flow.getDefined("Batch");
    if(!batchObj.id)
      batchObj.id = uuid.v4();
    batchObj.runs.map((val) => {
      if(!val.id)
        val.id = uuid.v4();
      return val;
    });
    var fileStorageDriver = new FileStorage({batchId:batchObj.id});
    fileStorageDriver.genBatchInfoPath().then(function(infoPath){
      fs.writeFileSync(infoPath, JSON.stringify(batchObj, null, 2));
    });
    var batch = new Batch(batchObj);
    session.assert(batch);
    session.match();
    return batch.id;
  }

  killBatch(batchId, reason){
    var KillBatch = flow.getDefined("KillBatch");
    var killBatch = new KillBatch({batchId:batchId, reason:reason});
    session.assert(killBatch);
    session.match();
    return batchId;
  }

  killRun(runId, reason){
    var KillRun = flow.getDefined("KillRun");
    var killRun = new KillRun({runId:runId, reason:reason});
    session.assert(killRun);
    session.match();
    return runId;
  }

  addServer(serverObj, serverName){
    var fileStorageDriver = new FileStorage({});
    if(serverObj.hasJmeter){
      serverObj.jmeterHost = serverObj.host;
      delete serverObj.host;
      var jmeterServerPath = fileStorageDriver.getJmeterServerPath(serverName);
      fs.writeFileSync(jmeterServerPath , JSON.stringify(serverObj));
      //Check if there exists a worker for that server already
      var existingWorker = this.session.getFacts(Worker).filter(function(worker){
        return worker.serverName === serverObj.serverName;
      });
      if(existingWorker.length){
        this.session.assert(new WorkerReplace({
          worker:existingWorker[0],
          jmeterHost: serverObj.jmeterHost,
          credential: serverObj.credential
        }));
        return existingWorker[0].id;
      }
      var workerId = this.addWorker(serverObj);
      return workerId;
    } else {
      serverObj.targetServerHost = serverObj.host;
      delete serverObj.host;
      var targetServerPath = fileStorageDriver.getTargetServerPath(serverName);
      fs.writeFileSync(targetServerPath , JSON.stringify(serverObj))
      return;
    }
  }

  getBatches(){
    return session.getFacts(Batch);
  }

  getRuns(batchId){
    var Run = flow.getDefined("Run");
    var runs = session.getFacts(Run);
    if(batchId){
      var batches = this.getBatches();
      var batch = batches.filter((batchObj) => {
        return batchObj.id === batchId;
      });

      if(batch.length === 0){
        return [];
      }
      batch = batch[0];

      return runs.filter((runObj) => {
        return runObj.batch === batch;
      });
    } else {
      return runs;
    }
  }
}
session.matchUntilHalt();
setInterval(function(){
  console.log(session.getFacts());
},30000)
module.exports = new Runtime();
