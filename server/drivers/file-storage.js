"use strict"

var Props = require("../../properties/dev-config.js");
var path = require("path");
var mkdirp = require("mkdirp");
var tempfilePath = path.join(__dirname, "../../", Props.temporaryFileDirectory);
var testFilePath = path.join(__dirname, "../../", Props.testFileDirectory);
var credentialsPath = path.join(__dirname, "../../", Props.credentialsFileDirectory);
var serversFilePath = path.join(__dirname, "../../", Props.serversFileDirectory);
var archiveFilePath = path.join(__dirname, "../../", Props.archiveFileDirectory);
var glob = require("glob");
var fs = require("fs");

class FileStorage {
  constructor(config){
    config = config || {};
    this.batchId = config.batchId;
    this.runId = config.runId;
  }

  getTestFilePath(testFile){
    return path.join(testFilePath, testFile);
  }

  getBatchPath(){
    return path.join(tempfilePath, "results", this.batchId);
  }

  getJmeterServerPath(serverName){
    return path.join(serversFilePath, "jmeter-servers", serverName + ".json");
  }

  getTargetServerPath(serverName){
    return path.join(serversFilePath, "target-servers", serverName + ".json");
  }

  getJmeterServers(){
    return glob.sync(path.join(serversFilePath, "jmeter-servers", "*")).map(function(fullPath){
      return path.basename(fullPath, ".json");
    });
  }

  getTargetServers(){
    return glob.sync(path.join(serversFilePath, "target-servers", "*")).map(function(fullPath){
      return path.basename(fullPath, ".json");
    });
  }

  genBatchInfoPath(){
    return new Promise((res, rej) => {
      mkdirp(path.join(tempfilePath, "results", this.batchId), {}, () => {
        res(path.join(tempfilePath, "results", this.batchId, "info.json"));
      });
    });
  }

  getBatchInfoPath(){
    return path.join(tempfilePath, "results", this.batchId, "info.json")
  }

  getBatchPath(){
    return path.join(tempfilePath, "results", this.batchId);
  }

  getBatchRunsPaths(){
    return glob.sync(path.join(tempfilePath, "results", this.batch, "*")).map(function(fullPath){
      return path.basename(fullPath);
    });
  }

  getCredentials(){
    return glob.sync(path.join(credentialsPath, "*.json")).map(function(fullPath){
      return path.basename(fullPath, ".json");
    });
  }

  getTestFiles(){
    return glob.sync(path.join(testFilePath, "*")).map(function(fullPath){
      return path.basename(fullPath);
    });
  }

  getRunPath(){
    return glob.sync(path.join(tempfilePath, "results", "*", this.runId))[0];
  }

  getBatches(){
    return glob.sync(path.join(tempfilePath, "results", "*")).map(function(fullPath){
      return path.basename(fullPath);
    });
  }

  getBatchRuns(){
    return glob.sync(path.join(tempfilePath, "results", this.batchId, "*")).map(function(fullPath){
      return path.basename(fullPath);
    });
  }

  genJmeterResultsPath(){
    return new Promise((res, rej) => {
      mkdirp(path.join(tempfilePath, "results", this.batchId, this.runId), {}, () => {
        res(path.join(tempfilePath, "results", this.batchId, this.runId,"jmeter-results.xml"));
      });
    });
  }

  genTargetServerResultsPath(){
    return new Promise((res, rej) => {
      mkdirp(path.join(tempfilePath, "results", this.batchId, this.runId), {}, () => {
        res(path.join(tempfilePath, "results", this.batchId, this.runId, "sys-results.json"));
      });
    });
  }

  getTargetServerResultsPath(){
    return path.join(tempfilePath, "results", this.batchId, this.runId);
  }

  getCredentialsPath(credentialsName){
    return path.join(credentialsPath, credentialsName + ".json");
  }

  getArchivePath(){
    return path.join(archiveFilePath, this.batchId + ".zip");
  }

  getArchive(){
    return glob.sync(path.join(archiveFilePath, "*"))
      .map(function(zipPath){
        return {id:path.basename(zipPath, ".zip"), creationTime:fs.statSync(zipPath).birthtime};
      });
  }

}

module.exports = FileStorage;
