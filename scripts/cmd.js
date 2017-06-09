const TeleBot = require('telebot');
const bot = new TeleBot('367184766:AAF0b-KzDrRihapNP4fy0Yxf9ukAMgow0VQ');
const url = require("./request");
const events = require("./events");
const mongo = require("../controllers/mongo");
const user = require("../controllers/user");
const news = require("./news");
const knteu_vk = require("./knteu_vk");
const teacher = require("../controllers/teacher");
const self = this;

bot.on(/^\/say (.+)$/, (msg, props) => {
    const text = props.match[1];
    self.notifySubscribers(text).then(result => {
        // send message to all subscribers
    });
});

bot.on("/start", (msg) => {
    let newUser = JSON.stringify({
        userID: msg.from.id,
        firstName: msg.from.first_name,
        lastName: msg.from.last_name,
        username: msg.from.username
    });
    addUser(newUser).then(result => {
        let text = `Доступні команди:
    👉розклад *курс* *факультет* \n Наприклад: \n розклад 3 фргтб`;
        // console.log(result);
        return bot.sendMessage(msg.from.id, text);
    });

    function addUser(newuser) {
        //console.log("addUser called");
        return new Promise((resolve, reject) => {
            user.add(newuser, resolve, reject);
        });
    }
});

bot.on(/розклад (.+)/i, (msg, props) => {
    const text = props.match[0];
    // text after 'розклад'
    let info = msg.text.toLowerCase().split(" ");
        if (info[1] && info[2]) {
            if (verifyFields(info[1], info[2])) {

                let facultyNum = defineFaculty(info[2]);
                if (!facultyNum) {
                    return bot.sendMessage(msg.from.id, `Невірно введена назва факультету.`);
                }

                // Magister schedule
                if (info[1] > 4) {
                    getMSchedule(facultyNum, info[1]).then(result => {
                        let answer = info[1] + ` курс ` + result[0] + `\n` + result[1];
                        return bot.sendMessage(msg.from.id, answer); // result[1] - link, result[0] - faculty
                    });

                    function getMSchedule(faculty, course) {
                        return new Promise((resolve, reject) => {
                            url.getMSchedule(course, faculty, resolve, reject);
                        });
                    }
                } else {
                    getSchedule(facultyNum, info[1]).then(result => {
                        let answer = info[1] + ` курс ` + result[0] + `\n` + result[1];
                        return bot.sendMessage(msg.from.id, answer); // result[1] - link, result[0] - faculty
                    });

                    function getSchedule(faculty, course) {
                        return new Promise((resolve, reject) => {
                            url.getSchedule(course, faculty, resolve, reject);
                        });
                    }
                }
            } else {
                return bot.sendMessage(msg.from.id, `Невірний формат даних.\n Приклад: "розклад 4 ффбс"`);
            }
        }
});

bot.on(/^розклад$/i, (msg, props) => {
    getBell().then(result => {
                return bot.sendMessage(msg.from.id, result);
            });

            function getBell() {
                return new Promise((resolve, reject) => {
                    url.getBellSchedule(resolve, reject);
                });
            }
    });

bot.on("text", (msg) => {
    const text = msg.text.toLowerCase();
    search_teacher(text).then(result => {
        const data = JSON.parse(result);
        let teacher = data.teacher;
        bot.sendMessage(msg.from.id, `${teacher.surname} ${teacher.name} ${teacher.fathername} \n 
Де шукати: ${data.room} \n
Кафедра: ${teacher.cathedra} \n
🎓 ${teacher.rank}. \n `);
        return msg.reply.photo(teacher.photo); 
    }, err => {
        console.log(err);
    });
});

function search_teacher(surname) {
    return new Promise((resolve, reject) => {
        teacher.get(surname, resolve, reject);
    });
}

function defineFaculty(fac) {
    let faculty = fac.toLowerCase(),
        facultyNum;

    if (faculty == `фоаіс`) {
        facultyNum = 0;
    } else if (faculty == `фемп`) {
        facultyNum = 1;
    } else if (faculty == `фтм`) {
        facultyNum = 2;
    } else if (faculty == `фргтб`) {
        facultyNum = 3;
    } else if (faculty == `ффбс`) {
        facultyNum = 4;
    } else if (faculty == `фмтп`) {
        facultyNum = 5;
    } else {
        return false;
    }
    return facultyNum;
}

function verifyFields(course, faculty) {
    // console.log(`Course: ${course}, faculty: ${faculty}`);
    if (typeof (+course) != 'number' || course > 6) {
        return false;
    } else {
        return true;
    }

    if (typeof (faculty) != 'string' || faculty.length < 3 || faculty.length > 4) {
        return false;
    } else {
        return true;
    }
}
exports.notifySubscribers = function (text) {
    return new Promise((resolve, reject) => {
        mongo.User.find({}, "userID", (err, docs) => {
            if (!err) {
                for (let i = 0; i < docs.length; i++) {
                    bot.sendMessage(docs[i]["userID"], text);
                }
            }
        });
        resolve();
    });
}

bot.start();