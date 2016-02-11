"use strict"

var Get = require("../services/gets");
var Post = require("../services/posts");
var $ = require("jquery");
var Bluebird = require("bluebird");

class UploadCredential{
  constructor(el){
    this.el = $(el);
    this.render();
  }

  render(){
    var credentialName = $("<input type='text'></input>")
    var userName = $("<input type='text'></input>");
    var password = $("<input type='password'></input>");
    var privateKey = $("<textarea></textarea>");
    var privateKeyRef = $("<input type='text'></input>");

    var submit = $("<input type='button' value='submit'></input>")

    submit.click(function(){
      if(credentialName.val() && userName.val() && (password.val() || privateKey.val() || privateKeyRef.val())){
        var obj = {
          username: userName.val()
        }
        userName.val("");
        if(password.val()){
          obj.password = password.val();
          password.val("");
        }
        if(privateKey.val()){
          obj.key = privateKey.val();
          privateKey.val("");
        }
        if(privateKeyRef.val()){
          obj.$key = privateKeyRef.val();
          privateKeyRef.val("");
        }
        Post.postCredentials(credentialName.val(), obj);
        credentialName.val("");
      }
    })

    this.el.append(
      $("<div></div>")
        .append(
          $("<div></div>").append(
            $("<label>Credential Name: </label>").append(credentialName))
        )
        .append(
          $("<div></div>").append(
            $("<label>User Name: </label>").append(userName))
        )
        .append(
          $("<div></div>").append(
            $("<label>Password: </label>").append(password))
        )
        .append(
          $("<div></div>").append(
            $("<label>Private Key: </label>").append(privateKey))
        )
        .append(
          $("<div></div>").append(submit)
        )
    )
  }
}

module.exports = UploadCredential;
