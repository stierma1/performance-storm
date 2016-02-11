"use strict"

class CommonRunFields{
  constructor(sysResults){
    this.sysResults = sysResults;
  }

  getTimestamps(){
    return this.sysResults.sysstat.hosts[0].statistics.map(function(stats){
      return stats.timestamp;
    });
  }

  getCPU(allOnly){
    return this.sysResults.sysstat.hosts[0].statistics.map(function(stats){
      return stats["cpu-load-all"].filter(function(val){
        if(allOnly){
          return val.cpu === "all";
        }
        return true;
      });
    });
  }

  getMemory(){
    return this.sysResults.sysstat.hosts[0].statistics.map(function(stats){
      return stats["memory"];
    });
  }

  getIO(){
    return this.sysResults.sysstat.hosts[0].statistics.map(function(stats){
      var io = stats["io"]
      return {
        tps: io.tps,
        rtps: io["io-reads"].rtps,
        bread: io["io-reads"].bread,
        wtps: io["io-writes"].wtps,
        bwrtn: io["io-writes"].bwrtn
      };
    });
  }

  getNetworkTraffic(){
    return this.sysResults.sysstat.hosts[0].statistics.map(function(stats){
      return stats.network["net-dev"];
    });
  }

  getDiskTraffic(){
    return this.sysResults.sysstat.hosts[0].statistics.map(function(stats){
      return stats.disk;
    });
  }

  generalReport(){
    return flatZip({
      timestamp: this.getTimestamps(),
      cpus: this.getCPU(),
      memory: this.getMemory(),
      io: this.getIO(),
      disk: this.getDiskTraffic(),
      network: this.getNetworkTraffic()
    })
  }
}

function flatZip(obj){
  var keys = [];
  for(var key in obj){
    keys.push(key);
  }

  var out = [];
  for(var i = 0; i < obj[keys[0]].length; i++){
    var iterObj = {};
    for(var keyIdx in keys){
      iterObj[keys[keyIdx]] = obj[keys[keyIdx]][i];
    }
    out.push(iterObj);
  }

  return out;
}
module.exports = CommonRunFields;
