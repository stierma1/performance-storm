"use strict"

var SSH = require("simple-ssh");
var client = require('scp2');
var Client = client;
var uuid = require("uuid");
var fs = require("fs");
var path = require("path");
var mediator = require("../mediator");
var _ = require("lodash");
var FileStorage = require("./file-storage");
var Credentials = require("./credentials");

class JmeterClient {
  constructor(config, session){
    this.batchId = config.batchId;
    this.workerId = config.workerId;
    this.runId = null;
    this._ssh = null;
    this.fileStorageDriver = null;
    this.credentialsDriver  = new Credentials(config.credential);

    this._sshConfig = {
      host: config.host,
    };
    this._scpConfig = {
      host: config.host,
    };
    mediator.emit("data", "jmeter setup", config);
    this.runObj = null;
    this.fileStorageDriver = null;
  }

  _buildNewSshClient(){
    this._ssh = new SSH(this._sshConfig);
  }

  initialize(){
    this._buildNewSshClient();
    mediator.emit("data", "initalize " + this._sshConfig.host);
    return new Promise((res, rej) => {
      this._ssh.exec("sudo ./initialize.sh", {
        debug:console.log,
        exit: (code, stdout, stderr) => {
          if(code !== 0){
            mediator.emit("error", "initialized " + this._sshConfig.host, {workerId: this.workerId, batchId:this.batchId, code:code, out:stdout, err:stderr});
          } else {
            mediator.emit("data", "initialized " + this._sshConfig.host, {workerId: this.workerId, batchId:this.batchId, code:code, out:stdout, err:stderr});
          }
          res();
        }
      }).start();
    });
  }

  consumeRun(run){
    this.runId = run.id;
    this.runObj = run;
  }

  claim(){
    return this.credentialsDriver.get()
      .then((creds) => {
        this._sshConfig = _.extend(creds, this._sshConfig);
        this._scpConfig = _.extend(creds, this._scpConfig);
        this._buildNewSshClient();
        mediator.emit("data", "claim " + this._sshConfig.host);
        return new Promise((res, rej) => {
          this._ssh.exec("sudo ./claim.sh " + this.id, {
            debug:console.log,
            exit: (code, stdout, stderr) => {
              if(code !== 0){
                mediator.emit("error", "claimed " + this._sshConfig.host, {workerId: this.workerId, batchId:this.batchId, code:code, out:stdout, err:stderr});
              } else {
                mediator.emit("data", "claimed " + this._sshConfig.host, {workerId: this.workerId, batchId:this.batchId, code:code, out:stdout, err:stderr});
              }
              res();
            }
          }).start();
        });
      })

  }

  run(){
    this._buildNewSshClient()
    mediator.emit("data", "run " + this._sshConfig.host);

    return new Promise((res, rej) => {
      var comm = "sudo TARGET_SERVER={TARGET_SERVER} TEST_FILE={TEST_FILE} ./run.sh {THREADS} {LOOPS}";
      comm = comm.replace("{TARGET_SERVER}", this.runObj.targetServerHost);
      comm = comm.replace("{TEST_FILE}", this.runObj.testFile);
      comm = comm.replace("{THREADS}", this.runObj.threads);
      comm = comm.replace("{LOOPS}", this.runObj.loops);
      
      this._ssh.exec(comm, {
        exit: (code, stdout, stderr) => {
          if(code !== 0){
            mediator.emit("error", "ran " + this._sshConfig.host, {workerId: this.workerId, batchId:this.batchId, code:code, out:stdout, err:stderr});
          } else {
            mediator.emit("data", "ran " + this._sshConfig.host, {workerId: this.workerId, batchId:this.batchId, code:code, out:stdout, err:stderr});
          }
          res();
        }
      }).start();
    });
  }

  unclaim(){
    this._buildNewSshClient()
    mediator.emit("data", "unclaim " + this._sshConfig.host)
    return new Promise((res, rej) => {
      this._ssh.exec("sudo ./unclaim.sh", {
        debug:console.log,
        exit: (code, stdout, stderr) => {
          if(code !== 0){
            mediator.emit("error", "unclaimed " + this._sshConfig.host, {workerId: this.workerId, batchId:this.batchId,code:code, out:stdout, err:stderr});
          } else {
            mediator.emit("data", "unclaimed " + this._sshConfig.host, {workerId: this.workerId, batchId:this.batchId,code:code, out:stdout, err:stderr});
          }
          res();
        }
      }).start();
    });
  }

  verifyRun(){
    this.fileStorageDriver = new FileStorage({batchId: this.batchId, runId:this.runId});
    return new Promise((res, rej) => {
      var client = new Client.Client(this._scpConfig);
      client.upload(this.fileStorageDriver.getTestFilePath(this.runObj.testFile), "test-files/" + this.runObj.testFile, (err) => {
        client.close();
        if(err){
          mediator.emit("error", "verified-run " + this._sshConfig.host, {workerId: this.workerId, batchId:this.batchId, error:err});
        } else {
          mediator.emit("data", "verified-run " + this._sshConfig.host);
        }
        res();
      });
    });
  }

  kill(){

  }

  getResults(){
    mediator.emit("data", "get-results " + this._sshConfig.host)
    return this.fileStorageDriver.genJmeterResultsPath()
      .then((resultsPath) => {
        return new Promise((res, rej) => {
          //Dont use default scp client because it leaks sessions
          var client = new Client.Client(this._scpConfig);
          client.download("jmeter-results.xml", resultsPath, (err) => {
            //Kill session if it has not completed in 60 secs
            setTimeout(() => {
              client.close();
            }, 60000);
            if(err){
              mediator.emit("error", "got-results " + this._sshConfig.host, {workerId: this.workerId, batchId:this.batchId, error:err});
            } else {
              mediator.emit("data", "got-results " + this._sshConfig.host);
            }
            res();
          });
      });
    });
  }

}


module.exports = JmeterClient;
