'use strict';

const utorrent = require('machinepack-utorrent');

module.exports = function setup(options, imports, callback) {
  const slack = imports.slack.controller;
  const logger = imports.log;
  logger.info('uTorrent plugin: Starting');

  if (!process.env.UTORRENT_HOST || !process.env.UTORRENT_PORT || !process.env.UTORRENT_USERNAME || !process.env.UTORRENT_PASSWORD) {
    console.log('uTorrent plugin error: Specify UTORRENT_HOST, UTORRENT_PORT, UTORRENT_USERNAME and UTORRENT_PASSWORD  in environment');
    process.exit(1);
  }

  // List torrents and their status in uTorrent
  slack.hears(['^torrents$', '^torrent list$', '^list torrent$'],
    'direct_message,direct_mention,mention', (bot, message) => {
      utorrent.listTorrents({
        host: process.env.UTORRENT_HOST,
        port: process.env.UTORRENT_PORT,
        username: process.env.UTORRENT_USERNAME,
        password: process.env.UTORRENT_PASSWORD,
      }).exec({
        error: () => bot.reply(message, 'I was unable to get the current torrent list :cry:'),
        success: torrentsList => {
          const details = torrentsList.map(torrent => `*${torrent.name}*: ${torrent.percentDone}% done, ${torrent.status}.`).join('\n');
          bot.reply(message, details);
        },
      });
    }
  );

  // Add a new torrent to uTorrent.
  slack.hears(['add torrent (.*)'],
    'direct_message,direct_mention,mention', (bot, message) => {
      const torrentUrl = message.match[1];
      utorrent.addTorrentUrl({
        host: process.env.UTORRENT_HOST,
        port: process.env.UTORRENT_PORT,
        username: process.env.UTORRENT_USERNAME,
        password: process.env.UTORRENT_PASSWORD,
        torrentUrl,
      }).exec({
        error: () => bot.reply(message, `I was unable to get '${torrentUrl}' to download :cry:`),
        success: () => bot.reply(message, 'Done :robot_face:'),
      });
    }
  );

  callback(null);
  logger.info('uTorrent plugin: Started');
};
