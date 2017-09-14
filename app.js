const https = require('https'),   
    fs = require('fs'),
    cmd = require("./scripts/cmd"),
    config = require("config"),
    express = require("express"),
    app = express();
/*
// certificates for https
let options = {
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/cert.pem'),
    passphrase: config.get("cert_pass")
};
https.createServer(options, function (req, res) {
    res.writeHead(200);
    res.end('Running...\n');
}).listen(443, () => {
    console.log("Server running...");
});
*/

app.listen(process.env.PORT || 3000, function(){
    console.log("Server running...");
});

