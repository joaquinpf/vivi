'use strict';

module.exports = function setup(options, imports, callback) {
  const slack = imports.slack.controller;
  const logger = imports.log;
  logger.info('Greeter plugin: Starting');

  function helloConversation(bot, message) {
    bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'robot_face',
    }, (err) => {
      if (err) {
        bot.botkit.log('Failed to add emoji reaction :(', err);
      }
    });

    slack.storage.users.get(message.user, (err, user) => {
      if (user && user.name) {
        bot.reply(message, `Hello ${user.name}!!`);
      } else {
        bot.reply(message, 'Hello.');
      }
    });
  }

  function callMeConversation(bot, message) {
    const name = message.match[1];
    slack.storage.users.get(message.user, (err, user) => {
      const chatUser = user || { id: message.user };
      chatUser.name = name;
      slack.storage.users.save(chatUser, (err, id) => {
        bot.reply(message, `Got it. I will call you ${chatUser.name} from now on.`);
      });
    });
  }

  function setNameConversation(err, convo, bot, message) {
    convo.say('I do not know your name yet!');
    convo.ask('What should I call you?', (response, convo) => {
      convo.ask(`You want me to call you '${response.text}'?`, [
        {
          pattern: 'yes',
          callback: (response, convo) => {
            // since no further messages are queued after this,
            // the conversation will end naturally with status == 'completed'
            convo.next();
          },
        },
        {
          pattern: 'no',
          callback: (response, convo) => {
            // stop the conversation. this will cause it to end with status == 'stopped'
            convo.stop();
          },
        },
        {
          default: true,
          callback: (response, convo) => {
            convo.repeat();
            convo.next();
          },
        },
      ]);

      convo.next();
    }, { key: 'nickname' }); // store the results in a field called nickname
    convo.on('end', convo => {
      if (convo.status === 'completed') {
        bot.reply(message, 'OK! I will update my dossier...');

        slack.storage.users.get(message.user, (err, user) => {
          if (!user) {
            user = {
              id: message.user,
            };
          }
          user.name = convo.extractResponse('nickname');
          slack.storage.users.save(user, (err, id) => {
            bot.reply(message, `Got it. I will call you ${user.name} from now on.`);
          });
        });
      } else {
        // this happens if the conversation ended prematurely for some reason
        bot.reply(message, 'OK, nevermind!');
      }
    });
  }

  function whoAmIConversation(bot, message) {
    slack.storage.users.get(message.user, (err, user) => {
      if (user && user.name) {
        bot.reply(message, `Your name is ${user.name}`);
        return;
      }
      bot.startConversation(message, (err, convo) => setNameConversation(err, convo, bot, message));
    });
  }

  slack.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', helloConversation);

  slack.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', callMeConversation);

  slack.hears(['what is my name', 'who am i'], 'direct_message,direct_mention,mention', whoAmIConversation);

  callback(null);
  logger.info('Greeter plugin: Started');
};
