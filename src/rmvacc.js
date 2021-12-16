//
//
const fs = require('fs');
const md5 = require('md5');
const crypto = require('crypto');
const colors = require('colors');
const btcnet = require('./components/btcnet')
const user = require('./components/user-interface');
//3 level
const marker = require('./components/marker-interface');
const registry = require('./components/registry-interface');
//deleting the selected regline
const RmvAccInterface = async (initfile, name = null, report = false) => {
	//if file not 
	if(!fs.existsSync(initfile)) {
		console.log(colors.red('there is no account directory'));
		return Promise.resolve({status: false, code: 27});
	}
	user.RawModeTrue();
	if (!name) name = await user.ScanAccountName();
	if (!name) {
		console.log('/ aborted... ');
		return Promise.resolve({status: false, code: 8});
	}
	console.log(colors.red('WARNING: ') + 'THE WALLET DATA WILL BE ERASED!!!');
	const userAnswer = await user.ExpectationAnswer('/ continue? (y/n): ');
	if (!userAnswer) {
		console.log('/ aborted... ');
		return Promise.resolve({status: true, code: 0});
	}
	const password_buf = await user.ScanAccountPassword();
	if (!password_buf) {
		console.log('/ aborted... ');
		return Promise.resolve({status: false, code: 7});
	}
	const pwd_hash = md5(password_buf);
	//get regline
	const regline = await registry.CheckOverlap(initfile, name);
	//check password
	const resultMessage = await registry.RemoveLine(initfile, regline, pwd_hash);
	if (!resultMessage) {
		console.log(colors.red('failed to delete'));
		console.log('/ exit... ');
		return Promise.resolve({status: false, code: 19});
	}
	//output a message
	if (report) console.log(colors.yellow('# marker: ' + resultMessage));
	console.log(colors.red('deleted (hash: '+ md5(resultMessage).substr(0,5) +')'));
	console.log('/ exit... ');
	return Promise.resolve({status: true, code: 0});
}
module.exports = { RmvAccInterface };