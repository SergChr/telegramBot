const mongo = require("./mongo");

exports.getRoom = (cathedra, resolve, reject) => {
    mongo.Cathedra.findOne({ title: cathedra }, { _id : 0, room : 1 }, (err, doc) => {
        if(err) {
            reject(err);
        }
        if(doc) {
            resolve(doc.room);
        }
    });
}