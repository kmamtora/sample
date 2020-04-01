const fs = require('fs');
const path = require('path');
const process = require("process");

var workspaceDir;

class FileOperations {

    constructor() {
        workspaceDir = path.join(process.cwd(), "workspace");
        if (!fs.existsSync(workspaceDir)) {
            try {
                fs.mkdirSync(workspaceDir);
            }
            catch (e) {
                console.log(e);
            }
        }
    }

    fnWorkspaceDir() {
        return workspaceDir;
    }

    fnWorkspaceFile(filename) {
        return path.join(workspaceDir, filename);
    }

    fnWriteFile(filename, message) {
        try {
            var abolutefile = path.join(workspaceDir, filename);
            fs.writeFileSync(abolutefile, message, {mode : 0o755});
        }
        catch (e) {
            console.log(e);
        }
    }

    fnReadFile(filename) {
        var result = '';
        try {
            var abolutefile = path.join(workspaceDir, filename);
            if(fs.existsSync(abolutefile)) {
                result = fs.readFileSync(abolutefile, { encoding: 'utf8' });
            }
        }
        catch (e) {
            console.log(e);
        }
        return result;
    }
}

module.exports = FileOperations;
