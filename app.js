const cmd = require("./scripts/cmd"),
    config = require("config"),
    express = require("express"),
    app = express();

app.listen(process.env.PORT || 3000, function(){
    console.log("Server running...");
});

