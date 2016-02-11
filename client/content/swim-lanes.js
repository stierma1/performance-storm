"use strict"

var Get = require("../services/gets");
var Post = require("../services/posts");
var $ = require("jquery");
var Bluebird = require("bluebird");

class SwimLanes{
  constructor(el){
    this.el = $(el);
    this.queuedBatches = [];
    this.queuedRuns = [];
    this.completedBatches = [];
    this.completedRuns = [];
    setInterval(() => {
      this.render();
    },3000)
  }

  render(){
    Bluebird.all([Get.getBatches(), Get.getRuns(), Get.getCompletedBatches(), Promise.resolve([])])
      .then((objs) => {
        this.el.empty();
        var row = $("<div class='row'></div>");
        row.append(this.createSwimLane("Unfinished Batches", objs[0]));
        row.append(this.createSwimLane("Unfinished Runs", objs[1]));
        //row.append(this.createSwimLane("Unpublished Batches", objs[2]));
        //row.append(this.createSwimLane("Unpublished Runs", objs[3]));
        this.el.append(row);
      })
  }

  createSwimLane(heading, objs){
    var lane = $("<ul></ul>");
    objs.map(function(obj){
      if(obj.state !== "done")
        lane.append($("<li></li>").attr("data-id", obj.id).text(obj.name || obj.id).css("font-weight", "bold").css("color", obj.state === "running" ? "green" : "black"));
    });
    return $("<div class='col-md-6'></div>").append($("<h3></h3>").text(heading)).append(lane);
  }
}

module.exports = SwimLanes;
