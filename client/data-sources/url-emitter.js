"use strict"

var $ = require("jquery");
var RX = require("rx");

module.exports = function(url, interval){
  var interval = RX.Observable.interval(interval || 5000);
  var subject = new RX.BehaviorSubject(1);

  return RX.Observable.merge(subject, interval)
  .flatMap(function(){
    return RX.Observable.return(url);
  })
  .publish()
  .refCount();
};
