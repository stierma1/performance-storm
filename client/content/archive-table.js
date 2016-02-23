"use strict"

var Get = require("../services/gets");
var $ = require("jquery");
var Bluebird = require("bluebird");

class ArchiveTable{
  constructor(el){
    this.el = $(el);
    this.el.css("display", "inline");
    this.el.DataTable({
      paging: false,
      columns: [
          { data: 'name'},
          { data: 'id' },
          { data: 'creationTime' },
          { data: 'viewReport'},
          { data: 'download'}
        ]
    });
    this.render();
  }

  render(){

    Get.getArchive()
      .then((archive) => {
        archive.sort(function(a,b){
          return new Date(a) - new Date(b);
        });
        var self = this;
        for(var i in archive){
          var id = archive[i].id;
          var data = {
            name: archive[i].name,
            id:archive[i].id,
            creationTime:new Date(archive[i].creationTime),
            viewReport:"<input class='view-report' type='button' data-id='" + id + "' value='View'></input>",
            download:"<input class='download' type='button' data-id='" + id + "' value='Download'></input>"
          };
          this.el.dataTable().fnAddData(data);
          //This is a terrible way of adding click events
        }
        this.el.dataTable().$(".view-report").click(function(){
            window.location.href += ("?batchId=" + $(this).attr("data-id"));
        });
        this.el.dataTable().$(".download").click(function(){
            Get.getArchiveZip($(this).attr("data-id"));
        });
      });
  }

}

module.exports = ArchiveTable;
