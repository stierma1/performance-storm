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
      var cpus = stats["cpu-load-all"].filter(function(val){
        if(allOnly){
          return val.cpu === "all";
        }
        return true;
      });
      if(allOnly){
        return cpus[0];
      }
      return cpus
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

  getNetworkTraffic(mergeNetwork){
    return this.sysResults.sysstat.hosts[0].statistics.map(function(stats){
      if(mergeNetwork){
        return stats.network["net-dev"].reduce(function(reduced, val){
          for(var i in val){
            if(i === "iface"){
              reduced[i] += val[i] + ",";
            } else {
              reduced[i] += val[i];
            }
          }
          return reduced;
        }, {"iface": "", "rxpck": 0.00, "txpck": 0.00, "rxkB": 0.00, "txkB": 0.00, "rxcmp": 0.00, "txcmp": 0.00, "rxmcst": 0.00})
      }
      return stats.network["net-dev"];
    });
  }

  getDiskTraffic(){
    return this.sysResults.sysstat.hosts[0].statistics.map(function(stats){
      return stats.disk;
    });
  }

  commonFields(){
    return flatZip({
      timestamp: this.getTimestamps(),
      cpus: this.getCPU(),
      memory: this.getMemory(),
      io: this.getIO(),
      disk: this.getDiskTraffic(),
      network: this.getNetworkTraffic()
    });
  }

  generalReport(){
    var flatten = flatZip({
      timestamp: this.getTimestamps(),
      cpus: this.getCPU(true),
      memory: this.getMemory(),
      io: this.getIO(),
      network: this.getNetworkTraffic(true)
    });

    var flatter = [];
    for(var idx in flatten){
      for(var i in flatten[idx]){
        for(var j in flatten[idx][i]){
          if(flatter[idx] === undefined){
            flatter[idx] = {};
          }
          flatter[idx][j] = flatten[idx][i][j];
        }
      }
    }
    return flatter;
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
