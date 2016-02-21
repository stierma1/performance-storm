var express = require("express");
//var cors = require("cors");
//var session = require("express-session");
var gets = require("./server/routes/gets");
var posts = require("./server/routes/posts");
var deletes = require("./server/routes/deletes");
require("http").globalAgent.maxSockets = 1000;
var app = express();

if(process.env.NODE_ENV !== "production"){
  app.use(require('connect-livereload')({port: 35730}));
}

gets(app);
posts(app);
deletes(app);

app.use("/", express.static(__dirname + "/build"));
app.listen(7171);
