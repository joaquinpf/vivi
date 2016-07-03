#!/usr/bin/env node

const path = require('path');
const architect = require('architect');
const configPath = path.join(__dirname, 'config.js');
const config = architect.loadConfig(configPath);

architect.createApp(config, err => {
  if (err) throw err;
  console.log('Vivi woke up');
});
