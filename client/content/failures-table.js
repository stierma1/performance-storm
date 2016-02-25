"use strict"

var Get = require("../services/gets");
var $ = require("jquery");
var Bluebird = require("bluebird");

class FailuresTable{
  constructor(el){
    this.el = $(el);
    this.el.css("display", "inline");
    this.el.DataTable({
      paging: false,
      columns: [
          { data: 'name'},
          { data: 'id' },
          { data: 'failureTime' },
          { data: 'reason'}
        ]
    });
    this.render();
  }

  render(){

    Get.getFailures()
      .then((failures) => {
        var self = this;
        for(var i in failures){
          var id = failures[i].id;
          var data = {
            name: failures[i].name,
            id:failures[i].id,
            failureTime:new Date(failures[i].failureTime),
            reason: failures[i].reason
          };
          this.el.dataTable().fnAddData(data);
        }
      });
  }

}

module.exports = FailuresTable;
