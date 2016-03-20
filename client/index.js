$ = require("jquery");
jQuery = require("jquery");

var StatusTable = require("./content/status-table");
var ArchiveTable = require("./content/archive-table");
var FailuresTable = require("./content/failures-table");
var UploadTestFile = require("./content/upload-test-file");
var UploadCredentials = require("./content/upload-credentials");
var UploadServerInfo = require("./content/upload-server-info");
var UploadBatch = require("./content/upload-batch");
var Bluebird = require("bluebird");
var StandardReport = require("./content/standard-report");
var JmeterReportTable = require("./content/jmeter-report-table");
require('expose?$!expose?jQuery!jquery');
require("bootstrap-webpack");

require('./vendor/startbootstrap-sb-admin-2-1.0.8/deps');
require("./vendor/startbootstrap-sb-admin-2-1.0.8/dist/js/sb-admin-2");
var ss = require("css-loader!./vendor/startbootstrap-sb-admin-2-1.0.8/bower_components/bootstrap/dist/css/bootstrap.min.css").toString();
ss += require("css-loader!./vendor/startbootstrap-sb-admin-2-1.0.8/bower_components/metisMenu/dist/metisMenu.min.css").toString();
ss += require("css-loader!./vendor/startbootstrap-sb-admin-2-1.0.8/dist/css/sb-admin-2.css").toString();
ss += require("css-loader!./vendor/startbootstrap-sb-admin-2-1.0.8/bower_components/font-awesome/css/font-awesome.min.css").toString();
ss += require("css-loader!./vendor/startbootstrap-sb-admin-2-1.0.8/bower_components/datatables/media/css/dataTables.jqueryui.min.css").toString();

function GetQueryStringParams(sParam){
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++){
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam){
            return sParameterName[1];
        }
    }
}

//module.exports = function(){
$(document).ready(function(){
  $("<style></style>").text(ss).appendTo($("head"));
    new UploadTestFile($("form"));
    //new SwimLanes($("#swimlanes"));
    new UploadCredentials($("#credentials"));
    new UploadServerInfo($("#server-info"));
    new UploadBatch($("#batch"));
    if($("#batches-status")){
      new StatusTable($("#batches-status"), "batches");
    }
    if($("#runs-status")){
      new StatusTable($("#runs-status"), "runs");
    }

    if($("#standard-report")){
      if(GetQueryStringParams("batchId")){
        var batchId = GetQueryStringParams("batchId");
        new StandardReport($("#standard-report"), batchId);
        new JmeterReportTable($("#jmeter-report-table"), batchId);
      } else {
        new FailuresTable($("#failures-table"));
        new ArchiveTable($("#archive-table"));
      }
    }


});
//}
