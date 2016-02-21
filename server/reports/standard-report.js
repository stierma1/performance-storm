"use strict"

var zip = require("node-zip");
var FileStorage = require("../drivers/file-storage");
var fs = require("fs");

class StandardReport {
  constructor(batchId){
    this.batchId = batchId;
    this.runs = [];
    this.info = null;
    this.fileStorageDriver = new FileStorage({batchId:batchId});
    this.zipFile = null;
    this.generalReport = null;
  }

  loadGeneralInfo(){
    var archiveBits = fs.readFileSync(this.fileStorageDriver.getArchivePath());
    this.zipFile = zip(archiveBits, {checkCRC32: true});
    this.info = JSON.parse(this.zipFile.files["info.json"].asText());

    return this.info;
  }

  generate(){
    if(!this.info){
      throw new Error("WTF Run loadGeneralInfo before this function");
    }

     this.generalReport = {
       id:this.info.id,
       name: this.info.name,
       publishGuides: this.info.publishGuides,
       runs: this.info.runs.map((runObj) => {
         var runReport = JSON.parse(this.zipFile.files[runObj.id + "/general-run-report.json"].asText());
         runObj.report = runReport;
         return runObj;
       })
     };

     this.generalReport.cpuSeries = this.generateCPUSeries();
     this.generalReport.memorySeries = this.generateMemorySeries();

     return this.generalReport;
  }

  generateCPUSeries() {
    return this.generalReport.runs.map(function(runObj){
      var series = [];
      for(var i = 0; i < runObj.report.length; i++){
        series.push([i, 100 - runObj.report[i].idle]);
      }

      return {
        label: runObj.name + ": " + runObj.id,
        data:series
      };
    });
  }

  generateMemorySeries(){
    return this.generalReport.runs.map(function(runObj){
      var series = [];
      for(var i = 0; i < runObj.report.length; i++){
        series.push([i, runObj.report[i]["memused-percent"]]);
      }

      return {
        label: runObj.name + ": " + runObj.id,
        data:series
      };
    });
  }

}

module.exports = StandardReport;
