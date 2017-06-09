const mongoose = require("mongoose");
const config = require("config");
// mongoose don't have own Promise library
mongoose.Promise = Promise;
const uri = config.get("mongo_uri");
mongoose.connect(uri);

const User = mongoose.model('User', {
    userID: String,
    firstName: String,
    lastName: String,
    username: String
});

const Event = mongoose.model("Event", {
    title: String,
    date: String,
    link: String,
    source: String
});

const Teacher = mongoose.model("Teacher", {
    surname: String,
    name: String,
    fathername: String,
    rank: String,
    cathedra: String,
    photo: String
});

const Cathedra = mongoose.model("Cathedra", {
   title: String,
   room: String
});

exports.User = User;
exports.Event = Event;
exports.Teacher = Teacher;
exports.Cathedra = Cathedra;