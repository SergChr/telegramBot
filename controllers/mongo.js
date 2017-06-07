const mongoose = require("mongoose");
const config = require("config");
// mongoose don't have own Promise library
mongoose.Promise = Promise;
const uri = config.get("mongo_uri");
mongoose.connect(uri);

let User = mongoose.model('User', {
    userID: String,
    firstName: String,
    lastName: String,
    username: String
});

let Event = mongoose.model("Event", {
    title: String,
    date: String,
    link: String,
    source: String
})


exports.User = User;
exports.Event = Event;