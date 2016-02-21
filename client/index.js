$ = require("jquery");
jQuery = require("jquery");

var StatusTable = require("./content/status-table");
var UploadTestFile = require("./content/upload-test-file");
var UploadCredentials = require("./content/upload-credentials");
var UploadServerInfo = require("./content/upload-server-info");
var UploadBatch = require("./content/upload-batch");
var Bluebird = require("bluebird");
require('expose?$!expose?jQuery!jquery');
require("bootstrap-webpack");

require('./vendor/startbootstrap-sb-admin-2-1.0.8/deps');
require("./vendor/startbootstrap-sb-admin-2-1.0.8/dist/js/sb-admin-2");
var ss = require("css-loader!./vendor/startbootstrap-sb-admin-2-1.0.8/bower_components/bootstrap/dist/css/bootstrap.min.css").toString();
ss += require("css-loader!./vendor/startbootstrap-sb-admin-2-1.0.8/bower_components/metisMenu/dist/metisMenu.min.css").toString();
ss += require("css-loader!./vendor/startbootstrap-sb-admin-2-1.0.8/dist/css/sb-admin-2.css").toString();
ss += require("css-loader!./vendor/startbootstrap-sb-admin-2-1.0.8/bower_components/font-awesome/css/font-awesome.min.css").toString();
ss += require("css-loader!./vendor/startbootstrap-sb-admin-2-1.0.8/bower_components/datatables/media/css/dataTables.jqueryui.min.css").toString();

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


});
//}
