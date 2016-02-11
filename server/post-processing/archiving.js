"use strict"

var archiver = require('archiver');
var fs = require("fs");
var FileStorage = require("../drivers/file-storage");

class Archive{
  constructor(){
  }

  publish(publishData){
    var archiveInProgress = archiver.create("zip",{})
    archiveInProgress.pipe(fs.createWriteStream((new FileStorage({batchId:publishData.batch.id})).getArchivePath()))
    archiveInProgress.directory(publishData.location, "/", {}).finalize();
  }

}

module.exports = new Archive();
