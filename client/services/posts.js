"use strict";
var $ = require("jquery");
var Props = require("../../properties/dev-web-config");

class Services {
  constructor(){

  }

  postCredentials(credentialName, obj){
    return $.ajax({url:Props.performanceStormUrl + "/credentials/" + credentialName, contentType:"application/json", method:"post", data:JSON.stringify(obj)});
  }

  postServer(serverName, obj){
    return $.ajax({url:Props.performanceStormUrl + "/servers/" + serverName, contentType:"application/json", method:"post", data:JSON.stringify(obj)});
  }

  postBatches(obj){
    return $.ajax({url:Props.performanceStormUrl + "/batches", contentType:"application/json", data:JSON.stringify(obj), method:"post"});
  }

}

module.exports = new Services();
