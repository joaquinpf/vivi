'use strict';

const os = require('os');

module.exports = function setup(options, imports, callback) {
  const slack = imports.slack.controller;
  const logger = imports.log;
  logger.info('Admin plugin: Starting');

  function formatUptime(uptime) {
    let fUnit = 'second';
    let fUptime = uptime;
    if (uptime > 60) {
      fUptime = fUptime / 60;
      fUnit = 'minute';
    }
    if (fUptime > 60) {
      fUptime = fUptime / 60;
      fUnit = 'hour';
    }
    if (fUptime !== 1) {
      fUnit = `${fUnit}s`;
    }

    fUptime = `${fUptime} ${fUnit}`;
    return fUptime;
  }

  function shutdownConversation(err, convo) {
    convo.ask('Are you sure you want me to shutdown?', [
      {
        pattern: slack.utterances.yes,
        callback: (response, convo) => {
          convo.say('Bye!');
          convo.next();
          setTimeout(() => {
            process.exit();
          }, 3000);
        },
      },
      {
        pattern: slack.utterances.no,
        default: true,
        callback: (response, convo) => {
          convo.say('*Phew!*');
          convo.next();
        },
      },
    ]);
  }

  // Bot shutdown conversation
  slack.hears(['shutdown'], 'direct_message,direct_mention,mention', (bot, message) => {
    bot.startConversation(message, shutdownConversation);
  });

  // Bot identity
  slack.hears(['identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', (bot, message) => {
      bot.reply(message, "I have to find out who I am... I'm scared... What if I'm not even human...?");
    }
  );

  // Bot uptime
  slack.hears(['uptime'],
    'direct_message,direct_mention,mention', (bot, message) => {
      const hostname = os.hostname();
      const uptime = formatUptime(process.uptime());
      bot.reply(message, `:robot_face: I am a bot named <@${bot.identity.name}>. I have been running for ${uptime} on ${hostname}.`);
    }
  );

  callback(null);
  logger.info('Admin plugin: Started');
};
