'use strict';

const Botkit = require('botkit');

module.exports = function setup(options, imports, register) {
  const logger = imports.log;
  logger.info('Slack plugin: Starting');

  if (!process.env.SLACK_TOKEN) {
    console.log('Slack plugin error: Specify SLACK_TOKEN in environment');
    process.exit(1);
  }

  // Instantiate Slack and start RTM API
  const controller = Botkit.slackbot({ debug: false, json_file_store: 'db' });
  controller.spawn({ token: process.env.SLACK_TOKEN }).startRTM();

  // Register Slack controller
  register(null, {
    slack: {
      controller,
    },
  });

  logger.info('Slack plugin: Started');
};
