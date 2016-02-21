
var Runtime = require("../runtime/engine");

module.exports = (app) => {
  app.delete("/batches/:batchId",(req, res) => {
    Runtime.killBatch(req.params.batchId, req.query.reason);
    res.status(200).end();
  });

  app.delete("/runs/:runId",(req, res) => {
    Runtime.killRun(req.params.runId, req.query.reason);
    res.status(200).end(); 
  });
}
