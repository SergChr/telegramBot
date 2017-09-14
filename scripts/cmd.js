const config = require("config");
const TeleBot = require('telebot');
const bot = new TeleBot(config.get("telegram.token"));
const url = require("./request");
const events = require("./events");
const mongo = require("../controllers/mongo");
const user = require("../controllers/user");
const news = require("./news");
const knteu_vk = require("./knteu_vk");
const teacher = require("../controllers/teacher");
const self = this;

bot.on(/^\/say (.+)$/, (msg, props) => {
    if(msg.from.id != config.get("admin_id")) {
        msg.reply.text("Відмовлено в доступі.");
        return;
    }
  
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
        const markup = bot.inlineKeyboard([
          [
              bot.inlineButton('Доступні команди', {callback: '/help'}),
              bot.inlineButton('Розклад', {callback: '/schedule'})
          ], [
              bot.inlineButton('Розклад дзвінків', {callback: '/bell_schedule'})
          ]
         ]);

      return bot.sendMessage(msg.from.id, 'Вибери команду:', {markup});
    });
});

bot.on('callbackQuery', msg => {
  const query = msg.data
  switch (query) {
    case '/help':
      showHelp(msg);
      break;
    case '/schedule':
      showFaculties(msg);
      break;
    case '/bell_schedule':
      showBellSchedule(msg);
      break;
  }

  if (Number.isInteger(+query)) {
    showCourse(msg, query)
  }
  if (Number.isInteger(+query[0]) && Number.isInteger(+query[2])) { // course & faculty
    const faculty = query.split(':')[1];
    showSchedule(+query[0], +faculty, msg.from.id);
  }
});

function showFaculties (msg) {
  const markup = bot.inlineKeyboard([
    [
        bot.inlineButton('ФРГТБ', {callback: '3'}),
        bot.inlineButton('ФОАІС', {callback: '0'}),
        bot.inlineButton('ФЕМП', {callback: '1'})
    ], [
        bot.inlineButton('ФМТП', {callback: '5'}),
        bot.inlineButton('ФФБС', {callback: '4'}),
        bot.inlineButton('ФТМ', {callback: '2'})
    ]
   ]);

   return bot.sendMessage(msg.from.id, 'Вибери факультет:', { markup });
}

function showCourse (msg, faculty) {
  const markup = bot.inlineKeyboard([
    [
        bot.inlineButton('1', {callback: `1:${faculty}`}),
        bot.inlineButton('2', {callback: `2:${faculty}`}),
        bot.inlineButton('3', {callback: `3:${faculty}`})
    ], [
        bot.inlineButton('4', {callback: `4:${faculty}`}),
        bot.inlineButton('5', {callback: `5:${faculty}`}),
        bot.inlineButton('6', {callback: `6:${faculty}`})
    ]
   ]);

   return bot.sendMessage(msg.from.id, 'Вибери курс:', { markup });
}

function showHelp (msg) {
  return bot.sendMessage(msg.from.id, `
    ▪️ Дізнавайся розклад, не шукаючи його на офіційному сайті університету. Щоб дізнатись розклад дзвінків, просто напиши "розклад":
    🔵розклад
    Щоб дізнатись розклад занять, напиши "розклад номер_курсу факультет" - наприклад:
    🔵розклад 2 ффбс
    Бот надішле тобі посилання на розклад занять для 2 курсу ФФБС.

    ▪️ Інформація про викладача. Достатньо ввести його прізвище і бот покаже тобі його повне ім'я та по батькові, назву кафедри, наукове звання,  а також у якому кабінеті можна його знайти. Наприклад:
    🔵Мазаракі
    (Поки що доступні викладачі з кафедр ФТМ, ФЕМП та ФФБС)

    ▪️Анонси подій та новини з офіційного сайту  університету та групи VK. Бот надішле тобі  усю свіжу інформацію, як тільки вона з'явиться.

    Є ідеї ? Напиши на sergs.chr2@gmail.com
  `)
}

function showBellSchedule (msg) {
  function getBell() {
    return new Promise((resolve, reject) => {
        url.getBellSchedule(resolve, reject);
    });
  }

  return getBell().then(result => {
    return bot.sendDocument(msg.from.id, result, { caption: 'Розклад дзвінків.' });
  });
}

function addUser(newUser) {
        return new Promise((resolve, reject) => {
            user.add(newUser, resolve, reject);
        });
    }

function showSchedule (course, faculty, to) {
  if (course > 4) {
    getMSchedule(faculty, course).then(result => {
      let answer = course + ` курс ` + result[0] + `\n` + result[1];
      return bot.sendMessage(to, answer); // result[1] - link, result[0] - faculty
    });

    function getMSchedule(faculty, course) {
        return new Promise((resolve, reject) => {
            url.getMSchedule(course, faculty, resolve, reject);
        });
    }
  } else {
    getSchedule(faculty, course).then(result => {
      let answer = course + ` курс ` + result[0] + `\n` + result[1];
      return bot.sendMessage(to, result); // result[1] - link, result[0] - faculty
     });

    function getSchedule(faculty, course) {
        return new Promise((resolve, reject) => {
            url.getSchedule(course, faculty, resolve, reject);
        });
    }
  }
}

bot.on("text", (msg) => {
    const text = msg.text.toLowerCase();
    console.log(`${msg.from.first_name} ${msg.from.last_name}: ${text}`);
    // if text contains all above commands
    if (text.match(/^розклад$/i) || text.match(/розклад (.+)/i) || text.match(/^\/say (.+)$/) || text == "/help" || text == "/start") {
      return; // don't need to find teacher, exit
    }
    
    search_teacher(text).then(result => {
        const data = JSON.parse(result);
        let teacher = data.teacher;
        bot.sendMessage(msg.from.id, `${teacher.surname} ${teacher.name} ${teacher.fathername} \n 
          Де шукати: ${data.room} \n
          Кафедра: ${teacher.cathedra} \n
          🎓 ${teacher.rank}. \n `);
        return msg.reply.photo(teacher.photo); 
    }, err => {
        // msg.reply.text("Введено невірну команду. Скористайся /help 😊");
        let menu = bot.keyboard([
          ['/start']
      ], {resize: true, once: true});
  
      return bot.sendMessage(msg.from.id, 'Скористайся меню.', { replyMarkup:menu });
    });
});

// bot.on("/help", (msg) => {
//     msg.reply.text(`
//       ▪️ Дізнавайся розклад, не шукаючи його на офіційному сайті університету. Щоб дізнатись розклад дзвінків, просто напиши "розклад":
//       🔵розклад
//        Щоб дізнатись розклад занять, напиши "розклад номер_курсу факультет" - наприклад:
//       🔵розклад 2 ффбс
//       Бот надішле тобі посилання на розклад занять для 2 курсу ФФБС.

//       ▪️ Інформація про викладача. Достатньо ввести його прізвище і бот покаже тобі його повне ім'я та по батькові, назву кафедри, наукове звання,  а також у якому кабінеті можна його знайти. Наприклад:
//       🔵Мазаракі
//       (Поки що доступні викладачі з кафедр ФТМ, ФЕМП та ФФБС)

//       ▪️Анонси подій та новини з офіційного сайту  університету та групи VK. Бот надішле тобі  усю свіжу інформацію, як тільки вона з'явиться.

//       Є ідеї ? Напиши на sergs.chr2@gmail.com
//     `);
//     const newUser = JSON.stringify({
//         userID: msg.from.id,
//         firstName: msg.from.first_name,
//         lastName: msg.from.last_name,
//         username: msg.from.username
//     });
//     addUser(newUser);
// });

function search_teacher(surname) {
    return new Promise((resolve, reject) => {
        teacher.get(surname, resolve, reject);
    });
}

// function verifyFields(course, faculty) {
//     if (typeof (+course) != 'number' || course > 6) {
//         return false;
//     } else {
//         return true;
//     }

//     if (typeof (faculty) != 'string' || faculty.length < 3 || faculty.length > 4) {
//         return false;
//     } else {
//         return true;
//     }
// }
// notify all
exports.notifySubscribers = function (text) {
    if(text == undefined) {
        return;
    }
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