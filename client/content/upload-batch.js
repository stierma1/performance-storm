"use strict"

var Get = require("../services/gets");
var Post = require("../services/posts");
var $ = require("jquery");
var Bluebird = require("bluebird");
var uuid = require("uuid");


class UploadBatch{
  constructor(el){
    this.el = $(el);
    this.credentials = [];
    this.testFiles = [];
    this.servers = [];
    Get.getCredentials().then((creds) => {
      this.credentials = creds;
    });
    Get.getTargetServers().then((servers) => {
      this.servers = servers;
    });
    Get.getTestFiles().then((files) => {
      this.testFiles = files;
    });
    this.runs = [];
    this.render();
  }

  getRunValues(){
    return this.runs.map(function(runObj){
      return runObj.getValue();
    }).filter(function(runVal){
      return runVal !== null;
    });
  }

  deleteRuns(){
    this.runs.map(function(runObj){
      return runObj.delete();
    });
    this.runs = [];
  }

  render(){
    var batchName = $("<input type='text'></input>");
    var publishGuides = $("<input type='text'></input>");
    var createRun = $("<input type='button' value='+'></input>")
    var runsList = $("<ol></ol>");

    var submit = $("<input type='button' value='submit'></input>");

    createRun.click(() =>{
      this.runs.push(new Run(runsList, this.credentials, this.servers, this.testFiles));
    });

    submit.click(() => {
      var runs = this.getRunValues();
      var obj = {
        id:uuid.v4(),
        name:batchName.val(),
        publishGuides: publishGuides.val(),
        runs:runs
      };
      Post.postBatches(obj);
      this.deleteRuns();
      batchName.val("");
      publishGuides.val("");

    });

    this.el.append(
      $("<div></div>")
        .append(
            $("<label>Batch Name: </label>").append(batchName)
        )
        .append(
            $("<label>Publish Guides: </label>").append(publishGuides)
        )
        .append(
          createRun
        )
        .append(
          $("<div>Name TestFile TargetServer Credential Tags Concurrency Loops RequestLimit</div>").append(runsList)
        )
        .append(
          $("<div></div>").append(submit)
        )
    )
  }
}

class Run {
  constructor(el, credentials, servers, testFiles){
    this.el = el;
    this.id = uuid.v4();
    this.render(credentials, servers, testFiles);
  }

  delete(){
    $("#" + this.id).remove();
  }

  render(credentials, servers, testFiles){
    var id = this.id;
    var runName = $("<input type='text' placeholder='Name'></input>");
    var testFilesField = $("<select></select>");
    testFiles.map(function(testFile){
      $("<option></option>").attr("value", testFile).text(testFile).appendTo(testFilesField);
    });
    var credentialsField = $("<select></select>");
    credentials.map(function(cred){
      $("<option></option>").attr("value", cred).text(cred).appendTo(credentialsField);
    });
    var serversField = $("<select></select>");
    servers.map(function(server){
      $("<option></option>").attr("value", server).text(server).appendTo(serversField);
    });
    var tags = $("<input type='text' placeholder='Tags'></input>");
    var loops = $("<input type='text' placeholder='Loops'></input>");
    var concurrency = $("<input type='text' placeholder='Concurrency'></input>");
    var requestLimit = $("<input type='text' placeholder='Request Limit'></input>");
    var deleteButton = $("<input type='button' value='x'></input>");

    this.getValue = function(){
      return {
        id:id,
        name: runName.val(),
        testFile: testFilesField.val(),
        credential : credentialsField.val(),
        targetServer: serversField.val(),
        tags: tags.val() || "",
        loops: parseInt(loops.val()) || 1,
        concurrency: parseInt(concurrency.val()) || 1,
        requestLimit: parseInt(requestLimit.val()) || 100000
      };
    };

    deleteButton.click(() => {
      this.delete();
      this.getValue = function(){
        return null;
      };
    })

    this.el.append(
      $("<li></li>").attr("id", id)
        .append(
          deleteButton
        )
        .append(
          runName
        )
        .append(
          testFilesField
        )
        .append(
          serversField
        )
        .append(
          credentialsField
        )
        .append(
          tags
        )
        .append(
          concurrency
        )
        .append(
          loops
        )
        .append(
          requestLimit
        )
    );
  }
}

module.exports = UploadBatch;
