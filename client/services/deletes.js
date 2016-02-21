"use strict";
var $ = require("jquery");
var Props = require("../../properties/dev-web-config");

class Services {
  constructor(){

  }

  deleteBatch(id, reason){
    return $.ajax({url:Props.performanceStormUrl + "/batches/" + id + "?reason=" + reason, method:"Delete"});
  }

  deleteRun(id, reason){
    return $.ajax({url:Props.performanceStormUrl + "/runs/" + id + "?reason=" + reason, method:"Delete"});
  }

}

module.exports = new Services();
