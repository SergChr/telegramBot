let cheerio = require("cheerio"),
    request = require("request");
const mongo = require("../controllers/mongo");
const cmd = require("./cmd");
const config = require("config");
const event = require("../controllers/event");
const updateDelay = config.get("update_delay");

const token = config.get("vk.token");

//  https://api.vk.com/method/METHOD_NAME?PARAMETERS&access_token=ACCESS_TOKEN

update();

function update() {
    return new Promise((resolve, reject) => {
         setInterval(() => {
        getPost().then(result => {
            checkEvent(result).then(answer => { // check if news is exist in DB (old or new event)
                
                // if it new I notify subscribers about that
                if (answer["code"] == true) { // if new
                    notifyAll(answer["event"]);
                }
            });
            resolve();
        });

         }, updateDelay);
    });
}

function notifyAll(event) {
    let text = `Новий пост на ${event.link}
${event.title}`;

    cmd.notifySubscribers(text).then(result => {
        // send message to all subscribers
    });
}

function checkEvent(data) {
    return new Promise((resolve, reject) => {
        event.check(data, resolve, reject);
    });
}

function getPost() {
    return new Promise((resolve, reject) => {
        let post;
        getQuery(`https://api.vk.com/method/wall.get?owner_id=-34511801&count=3&extended=0&filter=all&access_token=${token}`).then(result => {
            let data = JSON.parse(result);
            // console.log(data.response[3]);
            let title = data.response[3]["text"],
                link = "https://vk.com/knteu";
            post = JSON.stringify({
                title: title,
                link: link,
                source: "knteu-vk"
            });
            resolve(post);
        }, err => {
            console.log(err);
        });
    });

}

function getQuery(url) {
    return new Promise((resolve, reject) => {
        request(url, (err, res, body) => {
            if (err) {
                reject(err);
            } else {
                resolve(res.body);
            }
        });
    });
}