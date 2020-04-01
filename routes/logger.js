const fs = require('fs');
const path = require('path');
const process = require("process");

var fileName;

class Logger {

    constructor() {
        var logDir = path.join(process.cwd(), "log");
        if (!fs.existsSync(logDir)) {
            try {
                fs.mkdirSync(logDir);
            }
            catch (e) {
                console.log(e);
            }
        }
        var datetime = new Date();
        fileName = path.join(logDir, "awb" + datetime.toISOString().slice(0,10).split("-").join("") + '.log');
    }

    fnWriteLog(message) {
        var datetime = new Date();
        fs.appendFileSync(fileName, datetime.toISOString() + " " + message);
        fs.appendFileSync(fileName, '\n');
    }

    fnWriteLogs(message) {
        fs.appendFileSync(fileName, message);
        fs.appendFileSync(fileName, '\n');
    }
}

module.exports = Logger;
