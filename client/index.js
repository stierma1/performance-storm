$ = require("jquery");
jQuery = require("jquery");
var SwimLanes = require("./content/swim-lanes");
var UploadTestFile = require("./content/upload-test-file");
var UploadCredentials = require("./content/upload-credentials");
var UploadServerInfo = require("./content/upload-server-info");
var UploadBatch = require("./content/upload-batch");
var Bluebird = require("bluebird");
require('expose?$!expose?jQuery!jquery');
require("bootstrap-webpack");

//module.exports = function(){
$(document).ready(function(){
    new UploadTestFile($("form"));
    new SwimLanes($("#swimlanes"));
    new UploadCredentials($("#credentials"));
    new UploadServerInfo($("#server-info"));
    new UploadBatch($("#batch"));
});
//}
