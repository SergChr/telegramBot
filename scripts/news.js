let request = require("request"),
    cheerio = require("cheerio"),
    event = require("../controllers/event");
const mongo = require("../controllers/mongo");
const cmd = require("./cmd");
const updateDelay = 300000;

let url = `https://www.knteu.kiev.ua/b/read-news/?uk`;

updateEvents();

// parse news web page
function updateEvents() {
    return new Promise((resolve, reject) => {
        setInterval(() => {
            getPage(url).then(result => { // result - html page
                let data = getEvent(result); // get first news from html page
                checkEvent(data).then(answer => { // check if news is exist in DB (old or new event)
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
    if(event == undefined || event.title == undefined || event.link == undefined) {
        console.log("One news has undefined parameters.");
        return;
    }
    let text = `${event.title} \n 
${event.link}`;

    cmd.notifySubscribers(text).then(result => {
        // send message to all subscribers
    });
}

function getEvent(html) {
    let $ = cheerio.load(html),
        news = $(".nnews_item"),
        first = $(news).first(),
        title = $(first).find(".thin-header").text(),
        link = "https://www.knteu.kiev.ua" + $(first).find("a").attr("href");

    data = JSON.stringify({
        title: title,
        link: link,
        source: "news"
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
        event.check(data, resolve, reject);
    });
}