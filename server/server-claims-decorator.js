


module.exports = function(serverClaims){
  serverClaims.unclaim = function (claimObj){
    return new Promise((res, rej) => {
      if(this.servers[claimObj.targetServer].activeClaim === claimObj){
        this.servers[claimObj.targetServer].activeClaim = null;
      } else {
        var idx = this.servers[claimObj.targetServer].queue.indexOf(claimObj);
        if(idx){
          this.servers[claimObj.targetServer].queue.splice(idx, 1);
        }
      }
      res();
    })
  }.bind(serverClaims);

  serverClaims.addClaim = function(claimObj){
    this.servers[claimObj.targetServer] = this.servers[claimObj.targetServer] || {activeClaim:null, queue:[]};
    return new Promise((res, rej) => {
      this.servers[claimObj.targetServer].queue.push(claimObj);
      res();
    });
  }.bind(serverClaims);
}
