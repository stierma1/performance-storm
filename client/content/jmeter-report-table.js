"use strict"

var Get = require("../services/gets");
var $ = require("jquery");
var Bluebird = require("bluebird");

class JmeterReportTable{
  constructor(el, batchId){
    this.el = $(el);
    this.batchId = batchId;
    //this.el.css("display", "inline");
    this.el.DataTable({
      paging: false,
      columns: [
          { data: 'name'},
          { data: 'number of requests' },
          { data: 'average-time' },
          { data: 'max-time' },
          { data: 'min-time' },
          { data: 'median-time' }
        ]
    });
    this.render();
  }

  render(){

    Get.getJmeterReport(this.batchId)
      .then((fullReport) => {
        var self = this;
        for(var i in fullReport.timeStats){
          var stat = fullReport.timeStats[i];
          var data = {
            name: stat.label,
            "number of requests":stat.data.count,
            "average-time": stat.data.average,
            "max-time": stat.data.max,
            "min-time": stat.data.min,
            "median-time": stat.data.median,
          };
          this.el.dataTable().fnAddData(data);
        }
      });
  }

}

module.exports = JmeterReportTable;
