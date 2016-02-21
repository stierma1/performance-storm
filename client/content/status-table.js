"use strict"

var Get = require("../services/gets");
var Post = require("../services/posts");
var Delete = require("../services/deletes");
var $ = require("jquery");
var Bluebird = require("bluebird");

class StatusTable{
  constructor(el, type){
    this.el = $(el);
    this.contentType = type;
    this.el.DataTable({
      paging: false,
      columns: [
          { data: 'abort' },
          { data: 'name' },
          { data: 'id' },
          { data: 'state' },
          { data: 'creation-time' }
        ]
    });

    this.render();
    setInterval(() => {
      this.render();
    },3000);
  }

  render(){
    var getPromise = null;
    if(this.contentType === "runs"){
      getPromise = Get.getRuns();
    }
    if(this.contentType === "batches"){
      getPromise = Get.getBatches();
    }
    getPromise
      .then((batches) => {
        var removals = [];
        var adds = [];
        var i = 0;

        while(this.el.dataTable().fnGetData(i) !== null){
          var row = this.el.dataTable().fnGetData(i);
          var found = false;
          var batchFound = false;
          for(var j in batches){
            if(row.id === batches[j].id){
              if(row.state !== batches[j].state){
                this.updateState(i, batches[j].state);
              }
              found = true;
              break;
            }
          }

          if(!found){
            removals.push({idx:i, row:row});
          }
          i++;
        }

        for(var i in batches){
          var found = false;
          var j = 0;
          while(this.el.dataTable().fnGetData(j) !== null){
            if(this.el.dataTable().fnGetData(j).id = batches[j].id){
              found = true;
              break;
            }
            j++;
          }
          if(!found){
            adds.push(batches[i]);
          }
        }

        removals.sort(function(a,b){
          return a.idx - b.idx;
        });
        var self = this;
        for(var i in adds){
          var id = adds[i].id;
          var data = {
            abort:"<input type='button' data-id='" + id + "' value='X'></input>",
            name:adds[i].name,
            id:adds[i].id,
            state:adds[i].state,
            "creation-time":new Date(adds[i].creationTime || adds[i].startTime)};
          this.el.dataTable().fnAddData(data);
          //This is a terrible way of adding click events
          this.el.dataTable().$("td > input").click(function(){
            if(self.contentType === "batches"){
              Delete.deleteBatch($(this).attr("data-id"), "User killed via GUI");
            }
            if(self.contentType === "runs"){
              Delete.deleteRun($(this).attr("data-id"), "User killed via GUI");
            }

          });
        }

        while(removals.length > 0){
          this.el.dataTable().fnDeleteRow(removals.pop().idx);
        }

      });
  }

  updateState(idx, newState){
    this.el.dataTable().fnUpdate(newState, idx, 3);
  }
}

module.exports = StatusTable;
