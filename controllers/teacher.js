const mongo = require("./mongo");
const cathedra = require("./cathedra");

exports.get = (surname, resolve, reject) => {
    let new_surname = surname[0].toUpperCase() + surname.substring(1);
    mongo.Teacher.findOne({
        surname: new_surname
    }, {
        _id: 0
    }, (err, teacher) => {
        if (err) {
            reject(err);
        }
        if (teacher) {
            getRoom(teacher.cathedra).then(result => {
                let info = JSON.stringify({
                   room: result,
                    teacher: teacher
                });
                resolve(info);
            });
            
        } else {
            reject("Not found.");
        }
    });
}

function getRoom(title) {
    return new Promise((resolve, reject) => {
        cathedra.getRoom(title, resolve, reject);
    });
}