let mongo = require("./mongo");

exports.check = (event, resolve, reject) => {
    let data = JSON.parse(event);
    mongo.Event.findOne({title: data.title}, (err, event) => {
       if(err) {
           reject(err);
       }
        if(event) {
            let answer = {
                code: false
            }
            resolve(answer); // this event is already exist, don't need to notify and add
        } else if(!event) {
            addtoDB(data);
            let answer = {
                code: true,
                event: data
            }
            resolve(answer);
        }
    });
}

function addtoDB(event) {
    let newEvent = new mongo.Event({
        title: event.title,
        date: event.date,
        link: event.link,
        source: event.source
    });
    newEvent.save((err) => {
       if(err) {
           return false;
       }
    });
}