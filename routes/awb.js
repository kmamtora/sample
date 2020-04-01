const express = require('express');
const router = express.Router();
const fileoperations = require('./fileoperations');
const fs = require('fs');
const dirTree = require("directory-tree");
const { spawn } = require("child_process");

var _file = new fileoperations();

var _fileMd = 'document.md';
var _fileStatus = 'status.json';
var _fileOutputLog = 'output.txt';

router.get('/getworkspace', function(req, res, next) {
  const tree = dirTree(_file.fnWorkspaceDir());
  res.json({ 'message': 'Directory of workspace', 'status': 201, 'data': tree });
});

router.get('/generatejson', function(req, res, next) {
  const tree = dirTree(_file.fnWorkspaceDir(), { extensions: /\.json/ });
  var fileName = '';
  if(tree.children.length > 0) {
    for (var i = 0; i < tree.children.length; i++) {
      if(tree.children[i]['type'] == 'file') {
        if(tree.children[i]['extension'] == '.json') {
          if(tree.children[i]['name'] === _fileStatus) {
          } else {
            fileName = tree.children[i]['name'];
          }
        }
      }
    }

    if(fileName !== '') {
      var result = _file.fnReadFile(fileName);
      var jsonObject = JSON.parse(result);
      res.json({ 'message': fileName, 'status': 201, 'data': jsonObject });
    } else {
      res.json({ 'message': 'File not found', 'status': 400, 'data': null });
    }
  } else {
    res.json({ 'message': 'Unable to restore session', 'status': 400, 'data': null });
  }
});

router.post('/generatejsonpost', function(req, res, next) {
  var data = req.body.data;
  var fileName = req.body.fileName;
  if(fileName !== _fileStatus) {
    _file.fnWriteFile(fileName, JSON.stringify(JSON.parse(data), null, 2));
    var result = _file.fnReadFile(fileName);
    var jsonObject = JSON.parse(result);
    res.json({ 'message': 'Json File Saved', 'status': 201, 'data': jsonObject });
  } else {
    res.json({ 'message': 'unable to save file', 'status': 400, 'data': '' });
  }
});

router.post('/build', function(req, res, next) {
  const args = [
    //"--basedir", _file.fnWorkspaceDir(),
    "--json",
    req.body.fileName,
  ];
  const bdwb_proc = spawn('bdwb', args, {cwd: _file.fnWorkspaceDir()});
  bdwb_proc.stdout.pipe(res);
});

// logoupload POST
router.post('/logoupload', function(req, res, next) {
  if(fs.existsSync(_file.fnWorkspaceFile('logo.png'))) {
    fs.unlinkSync(_file.fnWorkspaceFile('logo.png'));
  }
  if(fs.existsSync(_file.fnWorkspaceFile('logo.jpg'))) {
    fs.unlinkSync(_file.fnWorkspaceFile('logo.jpg'));
  }
  if(fs.existsSync(_file.fnWorkspaceFile('logo.jpeg'))) {
    fs.unlinkSync(_file.fnWorkspaceFile('logo.jpeg'));
  }
  let selectedfile = req.files.file;
  let fileName = req.body.fileName;
  selectedfile.mv(_file.fnWorkspaceFile(fileName), function(err) {
    if (err) {
      return res.json({ 'message': 'Logo File Error', 'status': 400, 'data': null });
    }
  });
  let result = {'url': fileName};
  res.json({ 'message': 'Logo File Saved', 'status': 201, 'data': result });
});

router.get('/mdfiledownload', function(req, res, next) {
  var result = _file.fnReadFile(_fileMd);
  if(result == "") {
    res.json({ 'message': 'No session found', 'status': 400, 'data': result });
  } else {
    res.json({ 'message': 'Restore session', 'status': 201, 'data': result });
  }
});

router.post('/mdfileupload', function(req, res, next) {
  let mdData = req.body.mdData;
  let mdFileName = req.body.mdFileName;
  _file.fnWriteFile(mdFileName, mdData);
  let result = {'url': mdFileName};
  res.json({ 'message': 'File uploaded', 'status': 201, 'data': result });
});

router.post('/readjsonfile', function(req, res, next) {
  var result = {};
  var fileName = '';
  fileName = req.body.fileName;

  if(fileName !== _fileStatus) {
    result = _file.fnReadFile(fileName);
    res.json({ 'message': 'File found', 'status': 201, 'data': result });
  } else {
    res.json({ 'message': 'File not found', 'status': 400, 'data': '' });
  }
});

router.get('/status', function(req, res, next) {
  var result = '';
  result = _file.fnReadFile(_fileStatus);
  res.json({ 'message': 'Status', 'status': 201, 'data': result });
});

router.get('/buildlog', function(req, res, next) {
  var result = '';
  result = _file.fnReadFile(_fileOutputLog);
  res.json({ 'message': 'Logs', 'status': 201, 'data': result });
});

router.get('/download', function(req, res, next) {
  filepath = _file.fnWorkspaceFile('catalogsdk-awb-webui-5.0.zip');
  res.sendFile(filepath);
});

module.exports = router;
