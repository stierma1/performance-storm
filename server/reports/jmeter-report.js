"use strict"

var ADMZip = require("adm-zip");
var FileStorage = require("../drivers/file-storage");
var fs = require("fs");
var statSwitch = require("swituation").CustomSwitches["stat-maker"](["input"]);
var ContentLengthRegex = /Content-Length: ([0-9]+)\n/;

class JmeterReport {
  constructor(batchId){
    this.batchId = batchId;
    this.runs = [];
    this.info = null;
    this.fileStorageDriver = new FileStorage({batchId:batchId});
    this.zipFile = null;
    this.generalReport = null;
  }

  getMeta(){
    var zip = new ADMZip(this.fileStorageDriver.getArchivePath());

    return JSON.parse(zip.getZipComment());
  }

  loadGeneralInfo(){
    var zip = new ADMZip(this.fileStorageDriver.getArchivePath());
    this.zipFile = zip;
    this.info = JSON.parse(zip.getEntry("info.json").getData().toString("utf8"));

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
         var runReport = JSON.parse(this.zipFile.getEntry(runObj.id + "/jmeter-results.json").getData().toString("utf8"));
         runObj.report = runReport;
         return runObj;
       })
     };

     this.generalReport.timeStats = this.generateTimeStats();
     this.generalReport.successStats = this.generateSuccessStats();
     this.generalReport.responseCodeStats = this.generateResponseCodesStats();
     this.generalReport.throughputStats = this.generateThroughputStats();
     //this.generalReport.responseContentLength = this.generateResponseContentSizeStats();
     //this.generalReport.requestContentLength = this.generateRequestContentSizeStats();

     delete this.generalReport.runs;
     return this.generalReport;
  }

  generateTimeStats(){
    return this.generalReport.runs.map(function(runObj){
      //console.log(runObj.report.testResults)
      var times = runObj.report["testResults"]["httpSample"].map(function(sample){
        return parseFloat(sample["$"]["t"]);
      });
      statSwitch.reset();
      statSwitch.selectInput("input").set(times);
      return {
        label: runObj.name + ": " + runObj.id,
        name: runObj.name,
        id: runObj.id,
        data: statSwitch.aggregate()
      }
    });
  }

  generateThroughputStats(){
    return this.generalReport.runs.map(function(runObj){
      //console.log(runObj.report.testResults)
      var times = runObj.report["testResults"]["httpSample"].map(function(sample){
        return parseFloat(sample["$"]["ts"]);
      });
      statSwitch.reset();
      statSwitch.selectInput("input").set(times);
      return {
        label: runObj.name + ": " + runObj.id,
        name: runObj.name,
        id: runObj.id,
        data: statSwitch.selectOutput("count").get()/((statSwitch.selectOutput("max").get() - statSwitch.selectOutput("min").get())/1000)
      }
    });
  }

  generateSuccessStats(){
    return this.generalReport.runs.map(function(runObj){
      //console.log(runObj.report.testResults)
      var successes = runObj.report["testResults"]["httpSample"].map(function(sample){
        return sample["$"]["s"];
      });
      statSwitch.reset();
      statSwitch.selectInput("input").set(successes);
      var sucStat = statSwitch.aggregate();
      delete sucStat.sum
      delete sucStat.distribution
      return {
        label: runObj.name + ": " + runObj.id,
        name: runObj.name,
        id: runObj.id,
        data: sucStat
      }
    });
  }

  generateResponseCodesStats(){
    return this.generalReport.runs.map(function(runObj){
      //console.log(runObj.report.testResults)
      var responseCodes = runObj.report["testResults"]["httpSample"].map(function(sample){
        return sample["$"]["rc"];
      });
      statSwitch.reset();
      statSwitch.selectInput("input").set(responseCodes);
      return {
        label: runObj.name + ": " + runObj.id,
        name: runObj.name,
        id: runObj.id,
        data: statSwitch.aggregate()
      }
    });
  }

  generateResponseContentSizeStats(){
    return this.generalReport.runs.map(function(runObj){
      //console.log(runObj.report.testResults)
      var lengths = runObj.report["testResults"]["httpSample"].map(function(sample){
        if(!sample["responseHeader"] || !sample["responseHeader"][0] || !sample["responseHeader"][0]["_"]){
          return 0;
        }
        var match = ContentLengthRegex.exec(sample["responseHeader"][0]["_"]);

        if(match){
          return parseFloat(match[1]);
        }
        return 0;
      });

      statSwitch.reset();
      statSwitch.selectInput("input").set(lengths);

      return {
        label: runObj.name + ": " + runObj.id,
        name: runObj.name,
        id: runObj.id,
        data: statSwitch.aggregate()
      }
    });
  }

  generateRequestContentSizeStats(){
    return this.generalReport.runs.map(function(runObj){
      //console.log(runObj.report.testResults)
      var lengths = runObj.report["testResults"]["httpSample"].map(function(sample){
        if(!sample["requestHeader"] || !sample["requestHeader"][0] || !sample["requestHeader"][0]["_"]){
          return 0;
        }
        var match = ContentLengthRegex.exec(sample["requestHeader"][0]["_"]);

        if(match){
          return parseFloat(match[1]);
        }
        return 0;
      });
      statSwitch.reset();
      statSwitch.selectInput("input").set(lengths);
      return {
        label: runObj.name + ": " + runObj.id,
        name: runObj.name,
        id: runObj.id,
        data: statSwitch.aggregate()
      }
    });
  }

}

module.exports = JmeterReport;
