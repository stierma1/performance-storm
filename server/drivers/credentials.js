"use strict"

var FileStorage = require("./file-storage");
var fs = require("fs");

class Credentials {
  constructor(credentialsName){
    this.credentialsName = credentialsName;
    this.fileStorageDriver = new FileStorage({});
  }

  get(){
    return new Promise((res, rej) => {
      var credentialsPath = this.fileStorageDriver.getCredentialsPath(this.credentialsName);
      fs.readFile(credentialsPath, "utf8", (err, data) => {
        if(err){
          rej(err);
          return;
        }
        var creds = JSON.parse(data);
        var username = creds.username;
        var key = null;
        if(creds.key){
          key = creds.key;
          res({username:username, key:key, user: username, privateKey:key});
          return;
        }
        if(creds.password){
          res({username:username, password:creds.password, user:username});
          return;
        }
        if(creds.$key){
          fs.readFile(creds.$key, "utf8", (err, data) => {
            if(err){
              rej(err);
              return;
            }
            res({username:username, key:data, user:username, privateKey:data});
          })
          return;
        }

        rej(new Error("Password or key not found for user " + username));
      })
    });
  }
}

module.exports = Credentials;
