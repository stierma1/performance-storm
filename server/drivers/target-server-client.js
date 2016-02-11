"use strict"
var SSH = require("simple-ssh");
var client = require("scp2");
var Client = client;
var uuid = require("uuid");
var path = require("path");
var fs = require("fs");
var mediator = require("../mediator");
var _ = require("lodash");
var FileStorage = require("./file-storage");
var Credentials = require("./credentials");

class TargetServerClient {
  constructor(config, session){
    this.batchId = config.batchId;
    this.workerId = config.workerId;
    this.runId = config.runId;
    this.credentialsDriver  = new Credentials(config.credential);
    this.fileStorageDriver = new FileStorage({batchId:this.batchId, runId:this.runId});
    this._ssh = null;
    this._sshConfig = {
      host: config.host,
    };
    this._scpConfig = {
      host: config.host,
    };
  }

  _buildNewSshClient(){
    this._ssh = new SSH(this._sshConfig);
  }

  initialize(){
    this.credentialsDriver.get()
      .then((creds) => {

        this._sshConfig = _.extend(creds, this._sshConfig);
        this._scpConfig = _.extend(creds, this._scpConfig);

        this._buildNewSshClient();

      return new Promise((res, rej) => {
        this._ssh.exec("./initialize.sh", {
          exit: function(code, stdout, stderr){
            res();
          }
        }).start();
      });
    });
  }
  //deprecate
  claim(){
    return this.credentialsDriver.get()
      .then((creds) => {

        this._sshConfig = _.extend(creds, this._sshConfig);
        this._scpConfig = _.extend(creds, this._scpConfig);

        this._buildNewSshClient();
        return new Promise((res, rej) => {
          this._ssh.exec("sudo ./claim.sh", {
            pty: true,
            exit: function(code, stdout, stderr){
              res();
            }
          }).start();
        });
      });
  }

  unclaim(){
    this._buildNewSshClient();

    mediator.emit("data", "unclaim server " + this._sshConfig.host);
    return new Promise((res, rej) => {
      this._ssh.exec("sudo ./unclaim.sh", {
        pty: true,
        exit: (code, stdout, stderr) => {
          if(code !== 0){
            mediator.emit("error", "unclaimed server " + this._sshConfig.host, {workerId: this.workerId, batchId:this.batchId, runId:this.runId, code: code, stderr:stderr});
          } else {
            mediator.emit("data", "unclaimed server " + this._sshConfig.host);
          }
          res();
        }
      }).start();
    });
  }

  getResults(){
    this._buildNewSshClient();
    return new Promise((res, rej) => {
      this._ssh.exec("./get-results.sh", {
        exit: function(code, stdout, stderr){
          res();
        }
      }).start();
    }).then(() => {
      return this.fileStorageDriver.genTargetServerResultsPath()
      .then((resultsPath) => {
        return new Promise((res, rej) => {
          //Dont use default scp client because it leaks sessions
          var client = new Client.Client(this._scpConfig);
          client.download("sys.json", resultsPath, (err) => {
            //Kill session if it has not completed in 30 secs
            setTimeout(() => {
              client.close();
            }, 60000);
            if(err){
              mediator.emit("error", "got-results server " + this._scpConfig.host, {workerId: this.workerId, batchId:this.batchId, error:err});
            } else {
              mediator.emit("data", "got-results server" + this._scpConfig.host);
            }
            res();
          });
      });
    });
  });
  }

}

module.exports = TargetServerClient;
