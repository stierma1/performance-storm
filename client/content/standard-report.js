"use strict"

var Get = require("../services/gets");
var $ = require("jquery");
var Bluebird = require("bluebird");

class StandardReport{
  constructor(el, batchId){
    this.el = $(el);
    this.batchId = batchId;
    this.render();

  }

  render(){
    var getPromise = null;
    if(this.contentType === "runs"){
      getPromise = Get.getRuns();
    }
    if(this.contentType === "batches"){
      getPromise = Get.getBatches();
    }
    Get.getStandardReport(this.batchId)
      .then((report) => {
        var cpuEle = $(`<h3>Cpu Report</h3><div class="flot-chart">
            <div class="flot-chart-content" id="cpu-report"></div>
        </div>`);
        var memoryEle = $(`<h3>Memory Report</h3><div class="flot-chart">
            <div class="flot-chart-content" id="memory-report"></div>
        </div>`);
        this.el.append(cpuEle);
        this.el.append(memoryEle);
        $.plot($("#cpu-report"), report.cpuSeries, {
          yaxis: {min:0},
          series: {
            lines: { show: true },
            points: { show: true }
          }});
        $.plot($("#memory-report"), report.memorySeries, {
          yaxis: {min:0},
          series: {
            lines: { show: true },
            points: { show: true }
          }});
      });
  }

}

module.exports = StandardReport;
