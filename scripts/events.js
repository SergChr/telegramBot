let request = require("request"),
    cheerio = require("cheerio"),
    event = require("../controllers/event");
const mongo = require("../controllers/mongo");
const config = require("config");
const cmd = require("./cmd");
const updateDelay = config.get("update_delay");

const url = `https://www.knteu.kiev.ua/b/read-allnnoun/?uk`;

updateEvents();

// parse news web page
function updateEvents() {
    return new Promise((resolve, reject) => {
        setInterval(() => {
            getPage(url).then(result => { // result - html page
                let data = getEvent(result); // get first new event from html page
                checkEvent(data).then(answer => { // check if event is exist in DB (old or new event)
                    // if event new I notify subscribers about that
                    if (answer["code"] == true) { // yes, new event
                        notifyAll(answer["event"]);
                    }
                });
                resolve();
            });
        }, updateDelay);
    });
}


function notifyAll(event) {
    let text = `🗣Нова подія ! Відбудеться ${event.date}. \n
${event.title} \n 
${event.link}`;

    cmd.notifySubscribers(text).then(result => {
        // send message to all subscribers
    });
}

function getEvent(html) {
    let $ = cheerio.load(html),
        events = $(".an_item"),
        firstEvent = $(events).first(),
        title = $(firstEvent).find(".thin-header").text(),
        link = "https://www.knteu.kiev.ua" + $(firstEvent).find("a").attr("href");

    let date = {
        number: $(firstEvent).find(".announ_date_digit").text(),
        month: $(firstEvent).find(".announ_date_month").text()
    }
    data = JSON.stringify({
        title: title,
        date: `${date["number"]} ${date["month"]}`,
        link: link
    });
    return data;
}

function getPage(url) {
    return new Promise((resolve, reject) => {
        request(url, (err, res, body) => {
            if (err) {
                reject(err);
            }
            resolve(res.body);
        });
    });
}

function checkEvent(data) {
    return new Promise((resolve, reject) => {
        let info = JSON.parse(data);
        let updated = JSON.stringify({
           title: info.title,
            link: info.link,
            date: info.date,
            source: "event"
        });
        event.check(updated, resolve, reject);
    });
}
