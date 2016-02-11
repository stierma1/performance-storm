"use strict"

var Get = require("../services/gets");
var Post = require("../services/posts");
var $ = require("jquery");
var Bluebird = require("bluebird");

class UploadServerInfo{
  constructor(el){
    this.el = $(el);
    this.render();
  }

  render(){
    var serverName = $("<input type='text'></input>");
    var host = $("<input type='text'></input>");
    var credentials = $("<select></select>")
    var hasJmeter = $("<input type='checkbox'></input>");
    var currentCredentials = [];
    var pollCredentials = setInterval(function(){
      Get.getCredentials().then(function(creds){
        if(JSON.stringify(creds) !== JSON.stringify(currentCredentials)){
          currentCredentials = creds;
          credentials.empty();
          currentCredentials.map(function(credential){
            $("<option></option>").attr("value", credential).text(credential).appendTo(credentials);
          });
        }
      });
    }, 4000);

    var submit = $("<input type='button' value='submit'></input>")

    submit.click(function(){
      if(serverName.val() && host.val() && credentials.val()){

        var obj = {
          serverName: serverName.val(),
          host: host.val(),
          credential: credentials.val(),
          hasJmeter: hasJmeter.is(':checked')
        }

        host.val("");
        hasJmeter.attr('checked', false);

        Post.postServer(serverName.val(), obj);
        serverName.val("");
      }
    })

    this.el.append(
      $("<div></div>")
        .append(
          $("<div></div>").append(
            $("<label>Server Name: </label>").append(serverName))
        )
        .append(
          $("<div></div>").append(
            $("<label>Host: </label>").append(host))
        )
        .append(
          $("<div></div>").append(
            $("<label>Credential: </label>").append(credentials))
        )
        .append(
          $("<div></div>").append(
            $("<label>Has Jmeter: </label>").append(hasJmeter))
        )

        .append(
          $("<div></div>").append(submit)
        )
    )
  }
}

module.exports = UploadServerInfo;
