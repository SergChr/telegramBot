let mongo = require("./mongo");

exports.add = function (info, resolve, reject) {

    let user = JSON.parse(info);

    //check if exist user
    mongo.User.findOne({
        userID: user.userID
    }, function (err, person) {
        if (err) {
            // error in query
            reject(err);
        } else {
            // doesn't have error
            // user found
            if (person) {
                resolve(true);
            } else {
                // register
                let newUser = new mongo.User({
                   userID: user.userID,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username
                });
                newUser.save((err) => {
                    if(!err) {
                        resolve(`New user registered ${user.firstName} ${user.lastName}`);
                    }
                })
            }
        }
    });
}