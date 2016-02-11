"use strict"

var Get = require("../services/gets");
var Post = require("../services/posts");
var $ = require("jquery");
var Bluebird = require("bluebird");
var Props = require("../../properties/dev-web-config");

class UploadTestFile{
  constructor(el){
    this.el = $(el);
    this.render();
  }

  render(){
    this.el.attr("action", Props.performanceStormUrl + "/test-files")
  }
}

module.exports = UploadTestFile;
