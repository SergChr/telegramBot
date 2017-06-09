/*
    Get direct answers from user.
*/

const userList = {};

module.exports = {

    id: 'askUser',
    plugin(bot) {

        bot.mod('message', (data) => {

            const {message: msg, props} = data;
            const emptyMessage = { message: {}, props: {} };

            const id = msg.from.id;
            const ask = userList[id];

            if (ask) {
                delete userList[id];
                emptyMessage.promise = bot.event('ask.' + ask, msg, props);
                return emptyMessage;
            }

            return data;

        });

        bot.on('sendMessage', (args) => {

            const id = args[0];
            const opt = args[2] || {};

            const ask = opt.ask;

            if (ask) userList[id] = ask;

        });

    }
};
