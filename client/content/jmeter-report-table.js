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
          { data: 'id'},
          { data: 'num requests' },
          { data: 'num successes' },
          { data: 'num non-200s' },
          { data: 'average-time' },
          { data: 'max-time' },
          { data: 'min-time' },
          { data: 'median-time' },
          { data: '99th-max-time'},
          { data: '95th-max-time'}
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
          var successes = fullReport.successStats[i];
          var responseCodes = fullReport.responseCodeStats[i];

          var data = {
            name: stat.name,
            id: stat.id,
            "num requests":stat.data.count,
            "num successes": successes.data.distribution["true"] || 0,
            "num non-200s": responseCodes.data.count - (responseCodes.data.distribution["200"] || 0),
            "average-time": stat.data.average,
            "max-time": stat.data.max,
            "min-time": stat.data.min,
            "median-time": stat.data.median,
            "99th-max-time": stat.data["99thMax"],
            "95th-max-time": stat.data["95thMax"]
          };

          this.el.dataTable().fnAddData(data);
        }
      });
  }

}

module.exports = JmeterReportTable;
