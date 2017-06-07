let https = require('https'),
    fs = require('fs'),
    cmd = require("./scripts/cmd");

let options = {
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/cert.pem'),
    passphrase: "12345"
};

https.createServer(options, function (req, res) {
    res.writeHead(200);
}).listen(443, () => {
    console.log("Server running...");
});