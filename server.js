var express = require("express");
//var cors = require("cors");
//var session = require("express-session");
var gets = require("./server/routes/gets");
var posts = require("./server/routes/posts");
require("http").globalAgent.maxSockets = 1000;
var app = express();

//app.use(cors());
//app.use(session());

gets(app);
posts(app);

app.use("/", express.static(__dirname + "/build"));
app.listen(7171);
