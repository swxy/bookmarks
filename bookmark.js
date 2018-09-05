#!/usr/bin/env node
"use strict"
const http = require('http');
const url = require('url');
const fs = require('fs');
const readline = require('readline');
const querystring = require('querystring');
const path = require('path');
const spawnSync = require('child_process').spawnSync;
let currentYearAndMonth = getCurrentYearAndMonth();

http.createServer((req, res) => {
	let urlData = url.parse(req.url);
	//console.dir(urlData);
	let queryObj = querystring.parse(urlData.query);
	//console.dir(queryObj);
	queryObj.title && queryObj.url && writeToMarkdown(queryObj);
	res.writeHead(204, {"Content-Type": "image/jpeg"});
	res.end();
}).listen(3117);


function resolve(filename) {
	return path.resolve(__dirname, filename);
}

function getCurrentYearAndMonth() {
	try {
    const content = fs.readFileSync(resolve('README.md')) || '';
    const matched = content.toString().match(/(\d{4}-\d{1,2})-\d{1,2}/);
		if (matched) {
			return matched[1];
		}
		else {
			return getYearAndMonth();
		}
	}
	catch (e) {
		console.error(e);
  }
}

function getYearAndMonth() {
  const date = new Date();
  return  `${date.getFullYear()}-${date.getMonth()+1}`;
}

function getFilename () {
	let fileName = 'README.md';
	let name = '';
	let now = getYearAndMonth();
	// 如果当前时间和readme的年月符合
	if (now !== currentYearAndMonth) {
		name = currentYearAndMonth + '.md';
		try {
			let state = fs.statSync(resolve(name));
			!state.isFile() && fs.renameSync(resolve(fileName), resolve(name));
			console.log('rename: ', fileName, ' to ', name, ' @', now);
		}
		catch (e){
		    fs.renameSync(resolve(fileName), resolve(name));
		}
    currentYearAndMonth = now;
	}
	return fileName;
}

function isNewFile(filename) {
	try {
		let fileState = fs.statSync(resolve(filename));
		return fileState.isFile();
	}
	catch(e) {
		//console.error(e);
		return false;
	}
}

function writeToFile(filename, data) {
	fs.writeFile(resolve(filename), data, (err) => {
		if (err) console.err(err);
		// console.log('saved ' + filename);
		// pushToGit(title);
	});
}

function pushContent(data, dateLine, queryData) {
  const date = new Date();
  const d = decodeURIComponent;
  dateLine = dateLine || `### ${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} <br/>`;
  data.push(dateLine);
  data.push(`+ [${d(queryData.title)}](${queryData.url}) <br/>`);
  queryData.desc && data.push(`    ${d(queryData.desc)} <br/>`)
}

function writeToMarkdown(obj) {
	let fileName = getFilename();
	let data = [];
	let inserted = false;
	const date = new Date();
	if (!isNewFile(fileName)) {
	  pushContent(data, false, obj);
		writeToFile(fileName, data.join('\n'), obj.title);
		return;
	}
	const rl = readline.createInterface({
	    input: fs.createReadStream(resolve(fileName))
	});

	rl.on('line', (line) => {
		if (!inserted && line.startsWith('###')) {
      inserted = true;
			let date_str = line.match(/\d{4}-\d{1,2}-\d{1,2}/)[0];
			if (date_str && (new Date(date_str).getDate() === date.getDate())) {
			  pushContent(data, line, obj);
			  return;
			}
			pushContent(data, false, obj);
		}
		data.push(line);
	});
	rl.on('close', () => {
		if (!inserted) { //新建的文件
			pushContent(data, false, obj);
		}
		writeToFile(fileName, data.join('\n'));
	});
}

function pushToGit(title) {
	try {
		process.chdir(__dirname);
    title = title || '';
    const cmds = [
      ['git', ['add', '.']],
      ['git', ['commit', '-am', `"add ${title}"`]],
      ['git', ['pull', '--rebase']],
      ['git', ['push', 'origin', 'master']]
    ];
    cmds.forEach((cmd) => {
      let result = spawnSync(cmd[0], cmd[1]);
      console.log(result.output.join('\n'));
    });
  }
  catch (e) {
		console.error(e);
  }
}

setInterval(function(){
	console.log('push to github');
	pushToGit(new Date().toLocaleString());
}, 1000 * 60 * 60 * 3);

// pushToGit(new Date().toLocaleString());
// console.log('server start at 3117');
