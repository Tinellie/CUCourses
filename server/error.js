const colors = require('colors-console');

function error (message) {
    console.error(colors("red", "[ERROR] " + message));
}

module.exports = error;