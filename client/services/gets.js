"use strict";
var $ = require("jquery");
var Props = require("../../properties/dev-web-config");

class Services {
  constructor(){

  }

  getTestFiles(){
    return $.ajax(Props.performanceStormUrl + "/test-files");
  }

  getJmeterServers(){
    return $.ajax(Props.performanceStormUrl + "/jmeter-servers");
  }

  getTargetServers(){
    return $.ajax(Props.performanceStormUrl + "/target-servers");
  }

  getCredentials(){
    return $.ajax(Props.performanceStormUrl + "/credentials");
  }

  getBatches(){
    return $.ajax(Props.performanceStormUrl + "/batches");
  }

  getRuns(batchId){
    if(batchId){
      return $.ajax(Props.performanceStormUrl + "/batches/" + batchId + "/runs");
    } else {
      return $.ajax(Props.performanceStormUrl + "/runs");
    }
  }

  getCompletedBatches(){
    return $.ajax(Props.performanceStormUrl + "/results/batches");
  }

  getCompletedRuns(batchId){
    return $.ajax(Props.performanceStormUrl + "/results/batches/" + batchId + "/runs");
  }

  getStandardReport(batchId){
    return $.ajax(Props.performanceStormUrl + "/reports/standard-report/" + batchId);
  }

  getJmeterReport(batchId){
    return $.ajax(Props.performanceStormUrl + "/reports/jmeter-report/" + batchId);
  }

  getFailures(){
    return $.ajax(Props.performanceStormUrl + "/failures");
  }

  getArchive(){
    return $.ajax(Props.performanceStormUrl + "/archive");
  }

  getArchiveZip(batchId){
    window.open(Props.performanceStormUrl + "/archive/" + batchId, "_self");
  }
}

module.exports = new Services();
