'use strict';

module.exports = function startup(options, imports, register) {
  register(null, {
    log: {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
    },
  });
};
